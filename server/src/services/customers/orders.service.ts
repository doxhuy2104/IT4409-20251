import { Op, Transaction } from 'sequelize';
import { db } from '../../loaders/database.loader';
import * as ordersItemService from '../../services/customers/order-items.service';

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
				id: itemIds, // danh sách cartItems có id nằm trong itemIds
				cartId, // đúng cartId
			},
			transaction,
		});
		if (cartItems.length === 0) throw new Error('Giỏ hàng trống');

		const productIds = cartItems.map((item) => item.productId);
		const products = await db.products.findAll({
			where: { id: { [Op.in]: productIds } },
			transaction,
		});

		const productMap = new Map<
			number,
			{ price: number; stock: number; name: string }
		>();

		products.forEach((p) => {
			productMap.set(p.id, {
				price: Number(p.price),
				stock: Number(p.stock || 0),
				name: p.name,
			});
		});

		// Kiểm tra tồn kho
		for (const item of cartItems) {
			const product = productMap.get(item.productId);
			if (!product) {
				throw new Error('Không tìm thấy sản phẩm');
			}
			if (product.stock < item.quantity) {
				throw new Error(
					`Sản phẩm "${product.name}" không đủ hàng. Số lượng còn lại: ${product.stock}, số lượng bạn yêu cầu: ${item.quantity}`,
				);
			}
		}

		const totalAmount = cartItems.reduce((sum, item) => {
			const product = productMap.get(item.productId);
			if (!product) return sum;
			return sum + product.price * item.quantity;
		}, 0);

		const orderData = {
			customerId,
			warehouseId: warehouseId,
			shippingAddress: '',
			totalAmount,
		};
		const newOrder = await db.orders.create(orderData, { transaction });

		const orderItemsData = cartItems.map((item) => {
			const product = productMap.get(item.productId);
			if (!product) {
				throw new Error('Không tìm thấy sản phẩm');
			}
			return {
				orderId: newOrder.id,
				productId: item.productId,
				quantity: item.quantity,
				priceAtTime: product.price,
			};
		});

		await ordersItemService.createOrderItem(orderItemsData, transaction);

		// Trừ tồn kho sẽ được thực hiện trong changeStock khi order được confirm

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

export const confirmOrder = async (
	id: number,
	orderData: any,
	transaction?: Transaction,
) => {
	const order = await db.orders.findByPk(id, { transaction });

	if (!order) throw new Error('Không tìm thấy đơn hàng');
	if (order.status !== 'draft') {
		throw new Error(
			`Bạn không thể xác nhận đơn hàng này vì trạng thái của nó là ${order.status}`,
		);
	}

	// Validate shippingAddress không được null hoặc rỗng
	if (!orderData.shippingAddress || orderData.shippingAddress.trim().length === 0) {
		throw new Error('Địa chỉ giao hàng không được để trống');
	}

	const trimmedShippingAddress = orderData.shippingAddress.trim();

	// Update shippingAddress in Orders table
	await order.update(
		{
			shippingAddress: trimmedShippingAddress,
			paymentMethod: orderData.paymentMethod || null,
		},
		{ transaction }
	);

	const shippingData = {
		orderId: id,
		name: orderData.name || '',
		email: orderData.email || '',
		phone: orderData.phone || '',
		shippingAddress: trimmedShippingAddress,
		shippingProvider: '',
	};

	await db.shipping.create(shippingData, { transaction });

	const paymentData = {
		orderId: id,
		amount: (order as any)?.totalAmount,
		paymentMethod: orderData.paymentMethod,
	};

	await db.payments.create(paymentData, { transaction });

	if (orderData.paymentMethod?.toLowerCase() === 'cod') {
		await order?.update({ status: 'pending' }, { transaction });
		await changeStock(id, transaction);
	}

	const resOrder = await db.orders.findByPk(id, {
		include: [
			{ model: db.orderItems, include: [{ model: db.products, include: [{ model: db.productImages }] }] },
			{ model: db.payments },
			{ model: db.shipping },
		],
		transaction,
	});

	return resOrder;
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

// Cập nhật đơn hàng theo ID
export const updateOrderById = async (
	id: number,
	orderData: any,
	transaction?: Transaction,
) => {
	const allowedStatusFlow = [
		'draft',
		'pending',
		'processing',
		'shipped',
		'delivered',
		'cancelled',
	];

	// Lấy order hiện tại
	const order = await db.orders.findByPk(id, { transaction });
	if (!order) throw new Error('Order not found');

	if (
		orderData.status === 'draft' ||
		orderData.status === 'delivered' ||
		orderData.status === 'cancelled'
	) {
		throw new Error('Bạn không thể thay đổi trạng thái của đơn hàng này.');
	}

	const currentStatusIndex = allowedStatusFlow.indexOf(order.status);
	const newStatusIndex = allowedStatusFlow.indexOf(orderData.status);

	if (newStatusIndex === -1) {
		throw new Error(`Invalid status: ${orderData.status}`);
	}

	if (newStatusIndex < currentStatusIndex) {
		throw new Error(
			`Cannot change status from '${order.status}' to '${orderData.status}'`,
		);
	}

	// Chỉ cập nhật status
	await db.orders.update(
		{ status: orderData.status },
		{ where: { id }, transaction },
	);

	if (orderData.status === 'delivered' && order.status !== 'delivered') {
		await updateDailyRevenue(Number(order.totalAmount), transaction);
		// Nếu là COD, cập nhật trạng thái thanh toán thành công
		if (order.paymentMethod?.toLowerCase() === 'cod') {
			await db.payments.update(
				{ status: 'success' },
				{ where: { orderId: id }, transaction }
			);
		}
	}

	await changeStock(id, transaction);

	const resOrder = await db.orders.findByPk(id, {
		include: [
			{ model: db.orderItems, include: [{ model: db.products, include: [{ model: db.productImages }] }] },
			{ model: db.payments },
			{ model: db.shipping },
		],
		transaction,
	});

	return resOrder;
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
		{ model: db.orderItems, include: [{ model: db.products, include: [{ model: db.productImages }] }] },
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
	// Nếu status = 'all' hoặc không có, thì trả về tất cả orders bao gồm cả draft
	// Nếu có status cụ thể, thì chỉ lọc theo status đó
	if (filters.status && filters.status !== 'all') {
		where.status = filters.status;
	}
	// Nếu không có status filter hoặc status = 'all', không thêm điều kiện lọc status

	// Điều kiện lọc theo khoảng thời gian tạo đơn hàng
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

	// Điều kiện lọc theo phương thức thanh toán
	if (filters.paymentMethod) {
		where.paymentMethod = filters.paymentMethod;
	}

	// Truy vấn đơn hàng
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

export const changeStock = async (id: number, transaction?: Transaction) => {
	const order = await db.orders.findByPk(id, {
		include: [{ model: db.orderItems }],
		transaction,
	});
	if (!order) throw new Error('Không tìm thấy đơn hàng');

	if (order.status !== 'pending' && order.status !== 'cancelled') return;

	const orderitems = await db.orderItems.findAll({
		where: [
			{
				orderId: id,
			},
		],
		transaction,
	});

	for (const item of orderitems) {
		const product = await db.products.findByPk(item.productId, {
			transaction,
		});

		if (!product) continue;

		if (order.status === 'pending') {
			// Trừ số lượng
			if ((product.stock || 0) < item.quantity) {
				throw new Error(`Sản phẩm ${product.name} không đủ hàng`);
			}
			await product.update(
				{ stock: (product.stock || 0) - item.quantity },
				{ transaction },
			);
		} else if (order.status === 'cancelled') {
			// Cộng lại số lượng
			await product.update(
				{ stock: (product.stock || 0) + item.quantity },
				{ transaction },
			);
		}
	}
};

// Đánh dấu đơn hàng là đã nhận được (chỉ dành cho khách hàng)
export const markOrderAsReceived = async (
	id: number,
	customerId: number,
	transaction?: Transaction,
) => {
	const order = await db.orders.findOne({
		where: { id, customerId },
		include: [{ model: db.shipping }],
		transaction,
	});

	if (!order) {
		throw new Error('Không tìm thấy đơn hàng hoặc bạn không có quyền cập nhật đơn hàng này');
	}

	if (order.status !== 'shipped') {
		throw new Error(`Bạn chỉ có thể đánh dấu đã nhận được hàng khi đơn hàng đang ở trạng thái "đang vận chuyển". Trạng thái hiện tại: ${order.status}`);
	}

	// Cập nhật trạng thái đơn hàng thành 'delivered'
	await order.update({ status: 'delivered' }, { transaction });

	// Cập nhật doanh thu
	await updateDailyRevenue(Number(order.totalAmount), transaction);

	// Nếu là COD, cập nhật trạng thái thanh toán thành công
	if (order.paymentMethod?.toLowerCase() === 'cod') {
		await db.payments.update(
			{ status: 'success' },
			{ where: { orderId: id }, transaction }
		);
	}

	// Cập nhật deliveredAt trong shipping nếu có
	const shipping = await db.shipping.findOne({
		where: { orderId: id },
		transaction,
	});

	if (shipping) {
		await shipping.update(
			{ deliveredAt: new Date() },
			{ transaction },
		);
	}

	// Lấy lại đơn hàng với đầy đủ thông tin
	const updatedOrder = await db.orders.findByPk(id, {
		include: [
			{ model: db.orderItems, include: [{ model: db.products, include: [{ model: db.productImages }] }] },
			{ model: db.payments },
			{ model: db.shipping },
		],
		transaction,
	});

	return updatedOrder;
};

// Hàm cập nhật doanh thu theo ngày
const updateDailyRevenue = async (amount: number, transaction?: Transaction) => {
	const today = new Date();
	// Tạo đối tượng Date chỉ chứa ngày/tháng/năm để tracking
	// Lưu ý: db.revenue.findOrCreate sẽ tự handle date comparison nếu model định nghĩa là DATEONLY

	// Tìm bản ghi revenue cho hôm nay
	const [revenue, created] = await db.revenue.findOrCreate({
		where: { date: today },
		defaults: {
			date: today,
			totalRevenue: 0,
			totalOrders: 0
		},
		transaction
	});

	// Cập nhật doanh thu
	// Nếu vừa mới tạo thì giá trị ban đầu là 0, sau đó cộng thêm
	// Nếu đã tồn tại thì cộng dồn

	// Lưu ý: revenue.totalRevenue là string hoặc number tùy driver, ép kiểu cho chắc
	const currentRevenue = Number(revenue.totalRevenue);

	await revenue.update({
		totalRevenue: currentRevenue + amount,
		totalOrders: revenue.totalOrders + 1
	}, { transaction });
};
