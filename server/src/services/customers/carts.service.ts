import { db } from '../../loaders/database.loader';
import { Transaction } from 'sequelize';

export const getCartById = async (cartId: number) => {
	return await db.carts.findByPk(cartId);
};

export const getOrCreateCart = async (
	customerId: number,
	transaction?: Transaction,
) => {
	if (!customerId) throw new Error('Customer ID is required');

	let cart = await db.carts.findOne({
		where: { customerId },
		include: [
			{
				model: db.cartItems,
				include: [
					{
						model: db.productVariants,
						
					},
				],
			},
		],
		transaction,
	});

	if (!cart) {
		cart = await db.carts.create({ customerId }, { transaction });
	}

	return cart;
};

export const deleteCart = (cartId: number) => {
	return db.carts.destroy({ where: { id: cartId } });
};
