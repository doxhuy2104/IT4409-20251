import { db } from '../../loaders/database.loader';
import { Transaction } from 'sequelize';

export const getCartItemById = async (
	cartItemId: number,
	transaction?: Transaction,
) => {
	return await db.cartItems.findByPk(cartItemId, {
		include: [{ model: db.carts }, { model: db.productVariants }],
		transaction,
	});
};

export const getCartItemsByCartId = (cartId: number) => {
	return db.cartItems.findAll({ where: { cartId } });
};

export const addOrUpdateCartItem = async (
	cartId: number,
	variantId: number,
	quantity: number,
	transaction?: Transaction,
) => {
	const variant = await db.productVariants.findByPk(variantId, {
		transaction,
	});

	if (!variant) throw new Error('Variant not found');
	if (variant.stock < quantity) throw new Error('Not enough stock available');

	const existingItem = await db.cartItems.findOne({
		where: { cartId, variantId },
		transaction,
	});

	if (existingItem) {
		existingItem.quantity += quantity;
		return existingItem.save();
	}

	return db.cartItems.create(
		{ cartId, variantId, quantity },
		{ transaction },
	);
};

export const removeCartItem = (
	cartItemId: number,
	transaction?: Transaction,
) => {
	return db.cartItems.destroy({ where: { id: cartItemId }, transaction });
};

export const clearCartItems = (cartId: number, transaction?: Transaction) => {
	console.log(cartId);
	return db.cartItems.destroy({ where: { cartId: cartId }, transaction });
};
