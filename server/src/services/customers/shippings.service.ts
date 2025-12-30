import { db } from '../../loaders/database.loader';
import { Transaction } from 'sequelize';

export const getShippings = async (
	orderId: string,
	transaction?: Transaction,
) => {
	const shippings = await db.shipping.findAll({
		where: {
			orderId: orderId,
		},
		transaction,
	});
	return shippings;
};

export const createShipping = async (
	shipping: any,
	transaction?: Transaction,
) => {
	const newShipping = await db.shipping.create(shipping, { transaction });
	return newShipping;
};

export const updateShipping = async (
	id: number,
	customerId: number,
	data: any,
	transaction?: Transaction,
) => {
	// Kiểm tra xem order có thuộc về customer này không
	const order = await db.orders.findOne({
		where: { id, customerId }, // Kiểm tra id và customerId khớp
		transaction,
	});

	if (!order) {
		// Nếu không tìm thấy order với customerId này, trả về lỗi hoặc thông báo
		throw new Error('Order not found or does not belong to this customer');
	}
	await db.shipping.update(data, {
		where: {
			orderId: id,
		},
		transaction,
	});

	// Cập nhật thông tin shipping nếu kiểm tra thành công
	const updatedShipping = await db.shipping.findOne({
		where: {
			orderId: id,
		},
		transaction,
	});

	return updatedShipping;
};

export const deleteShipping = async (
	shippingId: string,
	transaction?: Transaction,
) => {
	const deletedShipping = await db.shipping.destroy({
		where: {
			id: shippingId,
		},
		transaction,
	});
	return deletedShipping;
};
