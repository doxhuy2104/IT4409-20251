import { Request, Response, NextFunction } from 'express';
import { ResOk } from '../../utility/response.util';
import * as cartService from '../../services/customers/carts.service';
import * as cartItemService from '../../services/customers/cart-items.service';
import { db } from '../../loaders/database.loader';

export const getCartWithItems = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const customerId = parseInt((req as any).user?.id);
		const cart = await cartService.getOrCreateCart(customerId, transaction);
		await transaction.commit();
		return res.status(200).json(new ResOk().formatResponse({ cart }));
	} catch (error) {
		await transaction.rollback();
		next(error);
	}
};

// Thêm sản phẩm vào giỏ hàng
export const addItemToCart = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const customerId = parseInt((req as any).user?.id);
		const cart = await cartService.getOrCreateCart(customerId, transaction);
		if (!cart || cart.customerId !== customerId) {
			return res
				.status(404)
				.json({
					message:
						'Cart not found or does not belong to the customer',
				});
		}
		const { variantId, quantity } = req.body;
		const item = await cartItemService.addOrUpdateCartItem(
			cart.id,
			variantId,
			quantity,
			transaction,
		);
		await transaction.commit();
		return res.status(200).json(new ResOk().formatResponse(item));
	} catch (error) {
		await transaction.rollback();
		next(error);
	}
};

// Cập nhật số lượng sản phẩm
export const updateCartItemQuantity = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const customerId = parseInt((req as any).user?.id);
		const cartItemId = parseInt(req.params.itemId);
		const cartItem: any = await cartItemService.getCartItemById(
			cartItemId,
			transaction,
		);
		if (!cartItem || cartItem.cart.customerId !== customerId)
			return res.status(404).json({ message: 'Item not found' });
		const { quantity } = req.body;
		if (quantity > cartItem.productVariant.stock)
			return res.status(404).json({ message: 'Not enough' });
		cartItem.quantity = quantity;
		cartItem.save();
		await transaction.commit();
		return res.status(200).json(new ResOk().formatResponse(cartItem));
	} catch (error) {
		await transaction.rollback();
		next(error);
	}
};

// Xoá sản phẩm khỏi giỏ
export const removeItemFromCart = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const customerId = parseInt((req as any).user?.id);
		const cartItemId = parseInt(req.params.itemId);
		const cartItem: any = await cartItemService.getCartItemById(
			cartItemId,
			transaction,
		);
		if (!cartItem || cartItem.cart.customerId !== customerId)
			return res.status(404).json({ message: 'Item not found' });
		await cartItemService.removeCartItem(cartItemId, transaction);
		await transaction.commit();
		return res
			.status(200)
			.json(new ResOk().formatResponse({ message: 'Item removed' }));
	} catch (error) {
		await transaction.rollback();
		next(error);
	}
};

// Xoá toàn bộ sản phẩm khỏi giỏ hàng
export const clearCart = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const customerId = parseInt((req as any).user?.id);
		const cart = await cartService.getOrCreateCart(customerId, transaction);
		if (!cart) return res.status(404).json({ message: 'Cart not found' });

		await cartItemService.clearCartItems(cart.id, transaction);
		await transaction.commit();
		return res
			.status(200)
			.json(new ResOk().formatResponse({ message: 'Cart cleared' }));
	} catch (error) {
		await transaction.rollback();
		next(error);
	}
};
