import { Request, Response, NextFunction } from 'express';
import { ResOk } from '../../utility/response.util';
import * as reviewService from '../../services/customers/reviews.service';
import { db } from '../../loaders/database.loader';

export const createReview = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const customerId = (req as any).user.id;
		const review = await reviewService.createReview(
			customerId,
			req.body,
			transaction,
		);
		await transaction.commit();
		return res.status(200).json(new ResOk().formatResponse(review));
	} catch (error) {
		await transaction.rollback();
		next(error);
	}
};

export const getAllReviews = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const reviews = await reviewService.getAllReviews(transaction);
		await transaction.commit();
		return res.status(200).json(new ResOk().formatResponse(reviews));
	} catch (error) {
		await transaction.rollback();
		next(error);
	}
};

export const getReviewsByProduct = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const productId = Number(req.params.id);
		const reviews = await reviewService.getReviewsByProduct(
			productId,
			transaction,
		);
		await transaction.commit();
		return res.status(200).json(new ResOk().formatResponse(reviews));
	} catch (error) {
		await transaction.rollback();
		next(error);
	}
};

export const updateReview = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const id = Number(req.params.id);
		const customerId = (req as any).user.id;
		const review = await reviewService.updateReview(
			id,
			customerId,
			req.body,
			transaction,
		);
		await transaction.commit();
		return res.status(200).json(new ResOk().formatResponse(review));
	} catch (error) {
		await transaction.rollback();
		next(error);
	}
};

export const approveReview = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const id = Number(req.params.id);
		const review = await db.reviews.findByPk(id, {
			include: [{ model: db.products }],
			transaction,
		});
		await review?.update({ isApproved: true }, { transaction });
		await transaction.commit();
		return res.status(200).json(new ResOk().formatResponse(review));
	} catch (error) {
		await transaction.rollback();
		next(error);
	}
};

export const deleteReview = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const id = Number(req.params.id);
		const isManager = (req as any).user?.isManager;
		const customerId = (req as any).user.id;

		if (isManager) {
			// Admin/Manager được phép xóa bất kỳ review nào
			const deleted = await db.reviews.destroy({
				where: { id },
				transaction,
			});
			if (!deleted) {
				await transaction.rollback();
				return res.status(404).json({ message: 'Review not found' });
			}
		} else {
			// Customer chỉ được phép xóa review của chính họ
			const deleted = await db.reviews.destroy({
				where: {
					id,
					customerId,
				},
				transaction,
			});
			if (!deleted) {
				await transaction.rollback();
				return res
					.status(403)
					.json({ message: 'Not allowed to delete this review' });
			}
		}

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
