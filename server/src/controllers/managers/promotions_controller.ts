import { Request, Response, NextFunction } from 'express';
import { ResOk } from '../../utility/response.util';
import * as promotionService from '../../services/managers/product-promotions.service';
import { db } from '../../loaders/database.loader';
import { Admins } from '../../models/admins.model';
import * as adminLogService from '../../services/managers/admin-logs.service';

/**
 * Validate promotion ID
 */
const validatePromotionId = (id: any): number => {
	const promotionId = Number(id);
	if (isNaN(promotionId) || promotionId <= 0) {
		throw new Error('Invalid promotion ID');
	}
	return promotionId;
};

/**
 * Validate product IDs array
 */
const validateProductIds = (productIds: any): number[] => {
	if (!Array.isArray(productIds) || productIds.length === 0) {
		throw new Error('Product IDs must be a non-empty array');
	}
	return productIds.map(id => {
		const productId = Number(id);
		if (isNaN(productId) || productId <= 0) {
			throw new Error('Invalid product ID');
		}
		return productId;
	});
};

/**
 * Check if promotion exists
 */
const checkPromotionExists = async (
	promotionId: number,
	transaction?: any
): Promise<any> => {
	const promotion = await db.promotions.findByPk(promotionId, { transaction });
	if (!promotion) {
		throw new Error('Promotion not found');
	}
	return promotion;
};

/**
 * Check if promotion is currently active
 */
const checkPromotionActive = (promotion: any): void => {
	const now = new Date();
	if (
		(promotion.startDate && new Date(promotion.startDate) > now) ||
		(promotion.endDate && new Date(promotion.endDate) < now)
	) {
		throw new Error('Promotion is not currently active');
	}
};

/**
 * Check if product exists
 */
const checkProductExists = async (
	productId: number,
	transaction?: any
): Promise<any> => {
	const product = await db.products.findByPk(productId, { transaction });
	if (!product) {
		throw new Error(`Product with ID ${productId} not found`);
	}
	return product;
};

/**
 * Check if product already has promotion
 */
const checkProductPromotionExists = async (
	productId: number,
	promotionId: number,
	transaction?: any
): Promise<boolean> => {
	const exists = await db.productPromotions.findOne({
		where: { productId, promotionId },
		transaction,
	});
	return !!exists;
};

/**
 * Get promotion with query filters
 */
export const getPromotion = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const data = await promotionService.getPromotion(req.body, transaction);
		await transaction.commit();
		return res.status(200).json(new ResOk().formatResponse(data));
	} catch (error) {
		await transaction.rollback();
		next(error);
	}
};

/**
 * Create new promotion for multiple products
 */
export const createPromotion = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const { productIds, ...promotionData } = req.body;

		validateProductIds(productIds);

		const created = await promotionService.createProductPromotion(
			productIds,
			promotionData,
			transaction,
		);

		if (!created || !created.id) {
			throw new Error('Failed to create promotion');
		}

		await adminLogService.CreateAdminLog(
			(req.user as Admins).id,
			'Create',
			created.id,
			'Promotion',
			promotionData,
			transaction,
		);

		await transaction.commit();
		return res.status(201).json(new ResOk().formatResponse(created));
	} catch (error) {
		await transaction.rollback();
		next(error);
	}
};

/**
 * Attach existing promotion to products
 */
export const productPromotion = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const promotionId = validatePromotionId(req.body.promotionId);
		const productIds = validateProductIds(req.body.productIds);

		const promotion = await checkPromotionExists(promotionId, transaction);
		checkPromotionActive(promotion);

		for (const productId of productIds) {
			await checkProductExists(productId, transaction);

			const alreadyExists = await checkProductPromotionExists(
				productId,
				promotionId,
				transaction
			);

			if (alreadyExists) {
				await transaction.rollback();
				return res.status(409).json({
					message: `Product ${productId} already has this promotion`,
				});
			}

			await db.productPromotions.create(
				{ productId, promotionId },
				{ transaction }
			);
		}

		const promo = await db.promotions.findByPk(promotionId, {
			include: [
				{
					model: db.productPromotions,
					include: [{ model: db.products }],
				},
			],
			transaction,
		});

		await adminLogService.CreateAdminLog(
			(req.user as Admins).id,
			'Attach',
			promotionId,
			'Product-Promotion',
			{ promotionId, productIds },
			transaction,
		);

		await transaction.commit();
		return res.status(201).json(new ResOk().formatResponse(promo));
	} catch (error) {
		await transaction.rollback();
		next(error);
	}
};

/**
 * Update promotion by ID
 */
export const updatePromotion = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const promotionId = validatePromotionId((req as any).params.id);

		await checkPromotionExists(promotionId, transaction);

		const updated = await promotionService.updatePromotion(
			promotionId,
			req.body,
			transaction,
		);

		if (!updated) {
			await transaction.rollback();
			return res.status(404).json({ message: 'Update failed' });
		}

		const resultPromotion = await db.promotions.findByPk(promotionId, {
			include: [
				{
					model: db.productPromotions,
					include: [{ model: db.products }],
				},
			],
			transaction,
		});

		await adminLogService.CreateAdminLog(
			(req.user as Admins).id,
			'Update',
			promotionId,
			'Promotion',
			req.body,
			transaction,
		);

		await transaction.commit();
		return res.status(200).json(new ResOk().formatResponse(resultPromotion));
	} catch (error) {
		await transaction.rollback();
		next(error);
	}
};

/**
 * Detach products from promotion
 */
export const detachProductFromPromotion = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const productIds = validateProductIds(req.body.productIds);
		const promotionId = validatePromotionId(req.body.promotionId);

		await checkPromotionExists(promotionId, transaction);

		await Promise.all(
			productIds.map((productId: number) =>
				db.productPromotions.destroy({
					where: { productId, promotionId },
					transaction,
				})
			)
		);

		await adminLogService.CreateAdminLog(
			(req.user as Admins).id,
			'Detach',
			promotionId,
			'Product-Promotion',
			req.body,
			transaction,
		);

		await transaction.commit();
		return res.status(200).json(
			new ResOk().formatResponse({ message: 'Detached successfully' })
		);
	} catch (error) {
		await transaction.rollback();
		next(error);
	}
};

/**
 * Delete promotion by ID
 */
export const deletePromotion = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const promotionId = validatePromotionId(req.params.id);

		await checkPromotionExists(promotionId, transaction);

		const deleted = await promotionService.deleteProductPromotion(promotionId);

		if (!deleted) {
			await transaction.rollback();
			return res.status(404).json({ message: 'Delete failed' });
		}

		await adminLogService.CreateAdminLog(
			(req.user as Admins).id,
			'Delete',
			promotionId,
			'Product-Promotion',
			{ deleted: true },
			transaction,
		);

		await transaction.commit();
		return res.status(200).json(
			new ResOk().formatResponse({ message: 'Deleted successfully' })
		);
	} catch (error) {
		await transaction.rollback();
		next(error);
	}
};
