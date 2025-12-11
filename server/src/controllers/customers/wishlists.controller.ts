import { Request, Response, NextFunction } from 'express';
import { ResOk } from '../../utility/response.util';
import * as wishlistService from '../../services/customers/wishlists.service';
import { db } from '../../loaders/database.loader';

export const getAllWishlists = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const customerId = await (req as any).user.id;
		const wishlists = await wishlistService.getAllWishlists(
			customerId,
			transaction,
		);
		await transaction.commit();
		return res.status(200).json(new ResOk().formatResponse(wishlists));
	} catch (error) {
		await transaction.rollback();
		next(error);
	}
};

export const createWishlist = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const customerId = (req as any).user.id;
		const productId = Number(req.params.id);
		const wishlist = await wishlistService.createWishlist(
			customerId,
			productId,
			transaction,
		);
		await transaction.commit();
		return res.status(200).json(new ResOk().formatResponse(wishlist));
	} catch (error) {
		await transaction.rollback();
		next(error);
	}
};

export const deleteWishlist = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const customerId = (req as any).user.id;
		if (!customerId) throw '';
		await wishlistService.deleteWishlist(
			customerId,
			Number(req.params.id),
			transaction,
		);
		await transaction.commit();
		return res
			.status(200)
			.json(
				new ResOk().formatResponse({ message: 'Deleted successfully' }),
			);
	} catch (error) {
		await transaction.rollback();
		next(error);
	}
};
