import { db } from '../../loaders/database.loader';
import * as ordersItemService from '../../services/customers/order-items.service';
import { Op, Transaction } from 'sequelize';

// Tao đơn hàng mới
export const createOrderFromCart = async (
	cartId: number,
	customerId: number,
	itemIds: number[],
	warehouseId?: number,
	transaction?: Transaction,
) => {
	try {
		const cart = await db.carts.findOne({
			where: { id: cartId },
			transaction,
		});
		if (!cart || cart.customerId !== customerId)
			throw new Error('Không tìm thấy giỏ hàng');

		const cartItems = await db.cartItems.findAll({
			where: {
				id: itemIds, 
				cartId, 
			},
			transaction,
		});
		if (cartItems.length === 0) throw new Error('Giỏ hàng trống');

		const variantIds = cartItems.map((item) => item.variantId);
		const variants = await db.productVariants.findAll({
			where: { id: variantIds },
			transaction,
		});

		const variantMap = new Map<
			number,
			{ price: number; discount: number }
		>();
		const variantStockMap = new Map<number, number>();

		variants.forEach((v) => {
			variantMap.set(v.id, {
				price: Number(v.price),
				discount: Number(v.discountPrice) || 0, // fallback nếu discount không có
			});
			variantStockMap.set(v.id, Number(v.stock));
		});

		// Kiểm tra tồn kho và lấy thông tin sản phẩm để hiển thị tên
		const products = await db.products.findAll({
			where: { id: { [Op.in]: variants.map(v => v.productId) } },
			transaction,
		});
		const productMap = new Map<number, string>();
		products.forEach((p) => productMap.set(p.id, p.name));

		for (const item of cartItems) {
			const stock = variantStockMap.get(item.variantId) || 0;
			if (stock < item.quantity) {
				const variant = variants.find((v) => v.id === item.variantId);
				const productName = variant
					? productMap.get(variant.productId) || 'Sản phẩm'
					: 'Sản phẩm';
				const availableStock = stock;
				throw new Error(
					`Sản phẩm "${productName}" không đủ hàng. Số lượng còn lại: ${availableStock}, số lượng bạn yêu cầu: ${item.quantity}`,
				);
			}
		}

		const totalAmount = cartItems.reduce((sum, item) => {
			const variant = variantMap.get(item.variantId) || {
				price: 0,
				discount: 0,
			};
			const effectivePrice = Math.max(
				0,
				variant.price - variant.discount,
			);
			return sum + effectivePrice * item.quantity;
		}, 0);

		const orderData = {
			customerId,
			warehouseId: warehouseId,
			shippingAddress: '',
			totalAmount,
		};
		const newOrder = await db.orders.create(orderData, { transaction });

		const orderItemsData = cartItems.map((item) => {
			const variant = variantMap.get(item.variantId) || {
				price: 0,
				discount: 0,
			};
			const effectivePrice = Math.max(
				0,
				variant.price - variant.discount,
			);
			return {
				orderId: newOrder.id,
				variantId: item.variantId,
				quantity: item.quantity,
				priceAtTime: effectivePrice,
			};
		});

		await ordersItemService.createOrderItem(orderItemsData, transaction);

		// Trừ tồn kho
		// for (const item of cartItems) {
		// 	await db.productVariants.increment(
		// 		{ stock: -item.quantity },
		// 		{ where: { id: item.variantId }, transaction },
		// 	);
		// }

		for (const item of cartItems) {
			await db.cartItems.destroy({ where: { id: item.id }, transaction });
		}
		// await db.carts.destroy({ where: { id: cart.id } });

		const orderWithItems = await db.orders.findByPk(newOrder.id, {
			include: [
				{ model: db.orderItems },
				{ model: db.payments },
				{ model: db.shipping },
			],
			transaction,
		});

		return orderWithItems;
	} catch (err) {
		throw err;
	}
};

export const cancelOrder = async (
	id: number,
	customerId: number,
	transaction?: Transaction,
) => {
	const order = await db.orders.findOne({
		where: [{ id: id, customerId }],
		include: [
			{ model: db.orderItems },
			{ model: db.payments },
			{ model: db.shipping },
		],
		transaction,
	});
	if (!order) throw new Error('Không tìm thấy đơn hàng');

	await order.update({ status: 'cancelled' }, { transaction });
	await changeStock(id, transaction);

	return order;
};


// Xóa đơn hàng theo ID
export const deleteOrderById = async (
	id: number,
	transaction?: Transaction,
) => {
	await db.shipping.destroy({ where: { orderId: id }, transaction });
	await db.payments.destroy({ where: { orderId: id }, transaction });
	await db.orderItems.destroy({ where: { orderId: id }, transaction });
	return await db.orders.destroy({ where: { id }, transaction });
};

// Lấy tất cả đơn hàng
export const getOrders = async (filters: any, transaction?: Transaction) => {
	const where: any = {};
	const include: any[] = [
		{ model: db.orderItems, include: [{ model: db.productVariants }] },
		{ model: db.payments },
		{ model: db.shipping },
	];

	// Điều kiện lọc theo id sản phẩm
	if (filters.id) {
		where.id = filters.id;
	}

	// Điều kiện lọc theo id khách hàng
	if (filters.customerId) {
		where.customerId = filters.customerId;
	}

	// Điều kiện lọc theo giá tiền
	if (filters.minTotalAmount || filters.maxTotalAmount) {
		where.totalAmount = {};
		if (filters.minTotalAmount) {
			where.totalAmount[Op.gte] = filters.minTotalAmount;
		}
		if (filters.maxTotalAmount) {
			where.totalAmount[Op.lte] = filters.maxTotalAmount;
		}
	}

	// Điều kiện lọc theo trạng thái đơn hàng
	if (filters.status) {
		where.status =
			filters.status !== 'draft' ? filters.status : { [Op.not]: 'draft' };
	} 

	if (filters.startDate && filters.endDate) {
		where.createdAt = {
			[Op.between]: [
				new Date(filters.startDate),
				new Date(filters.endDate),
			],
		};
	} else if (filters.startDate) {
		where.createdAt = {
			[Op.gte]: new Date(filters.startDate),
		};
	} else if (filters.endDate) {
		where.createdAt = {
			[Op.lte]: new Date(filters.endDate),
		};
	}

	if (filters.paymentMethod) {
		where.paymentMethod = filters.paymentMethod;
	}

	const [rows, count] = await Promise.all([
		db.orders.findAll({
			where,
			include,
			order: [['createdAt', 'DESC']],
			limit: filters.limit,
			offset: filters.offset,
			transaction,
		}),
		db.orders.count({
			where,
			transaction,
		}),
	]);

	return [rows, count];
};

export const getOrderById = async (id: number, transaction?: Transaction) => {
	const order = await db.orders.findByPk(id, { transaction });
	return order;
};
