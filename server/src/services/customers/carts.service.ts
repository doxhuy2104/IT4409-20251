import { db } from '../../loaders/database.loader';
import { Transaction } from 'sequelize';

export const getCartById = async (cartId: number) => {
	// Tìm giỏ hàng theo cartId
	return await db.carts.findByPk(cartId);
};

export const getOrCreateCart = async (
	customerId: number,
	transaction?: Transaction,
) => {
	if (!customerId) throw new Error('Customer ID is required');

	// Tìm giỏ hàng dựa trên customerId
	let cart = await db.carts.findOne({
		where: { customerId },
		include: [
			{
				model: db.cartItems,
				include: [
					{
						model: db.products,
						include: [
							{
								model: db.productImages,
							},
						],
					},
				],
			},
		],
		transaction,
	});

	if (!cart) {
		// Nếu không tìm thấy giỏ hàng, tạo mới
		cart = await db.carts.create({ customerId }, { transaction });
	}

	return cart;
};

export const deleteCart = (cartId: number) => {
	// Xóa giỏ hàng theo cartId
	return db.carts.destroy({ where: { id: cartId } });
};
