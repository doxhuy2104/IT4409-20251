import { db } from '../../loaders/database.loader';
import { Transaction, Op } from 'sequelize';

/**
 * Interface for promotion query parameters
 */
interface PromotionQueryParams {
	id?: number;
	name?: string;
	discountPercent?: number;
	discountAmount?: number;
	minimumPurchaseAmount?: number;
	maximumDiscountAmount?: number;
	discountCode?: string;
	usageLimit?: number;
	usageCount?: number;
	usageLimitPerCustomer?: number;
	isActive?: boolean;
	isDeleted?: boolean;
	isExpired?: boolean;
	startDate?: Date;
	endDate?: Date;
}

/**
 * Build where clause for promotion query
 */
const buildPromotionWhereClause = (data: PromotionQueryParams): any => {
	const whereClause: any = {};

	if (data.id !== undefined) whereClause.id = data.id;
	if (data.name !== undefined) whereClause.name = data.name;
	if (data.discountPercent !== undefined)
		whereClause.discountPercent = data.discountPercent;
	if (data.discountAmount !== undefined)
		whereClause.discountAmount = data.discountAmount;
	if (data.minimumPurchaseAmount !== undefined)
		whereClause.minimumPurchaseAmount = data.minimumPurchaseAmount;
	if (data.maximumDiscountAmount !== undefined)
		whereClause.maximumDiscountAmount = data.maximumDiscountAmount;
	if (data.discountCode !== undefined)
		whereClause.discountCode = data.discountCode;
	if (data.usageLimit !== undefined) whereClause.usageLimit = data.usageLimit;
	if (data.usageCount !== undefined) whereClause.usageCount = data.usageCount;
	if (data.usageLimitPerCustomer !== undefined)
		whereClause.usageLimitPerCustomer = data.usageLimitPerCustomer;
	if (data.isActive !== undefined) whereClause.isActive = data.isActive;
	if (data.isDeleted !== undefined) whereClause.isDeleted = data.isDeleted;
	if (data.isExpired !== undefined) whereClause.isExpired = data.isExpired;
	if (data.startDate !== undefined)
		whereClause.startDate = { [Op.gte]: data.startDate };
	if (data.endDate !== undefined)
		whereClause.endDate = { [Op.lte]: data.endDate };

	return whereClause;
};

/**
 * Validate promotion data
 */
const validatePromotionData = (data: any): void => {
	if (!data.name || data.name.trim().length === 0) {
		throw new Error('Promotion name is required');
	}
	if (!data.startDate || !data.endDate) {
		throw new Error('Start date and end date are required');
	}
	if (new Date(data.startDate) >= new Date(data.endDate)) {
		throw new Error('Start date must be before end date');
	}
};

/**
 * Validate product IDs
 */
const validateProductIds = (productIds: number[]): void => {
	if (!Array.isArray(productIds) || productIds.length === 0) {
		throw new Error('Product IDs are required');
	}
	for (const id of productIds) {
		if (typeof id !== 'number' || id <= 0) {
			throw new Error('Invalid product ID');
		}
	}
};

/**
 * Check if products exist
 */
const checkProductsExist = async (
	productIds: number[],
	transaction?: Transaction,
): Promise<void> => {
	const products = await db.products.findAll({
		where: { id: productIds },
		attributes: ['id'],
		transaction,
	});
	if (products.length !== productIds.length) {
		throw new Error('One or more products not found');
	}
};

/**
 * Get promotion by query parameters
 */
export const getPromotion = async (
	data: PromotionQueryParams,
	transaction?: Transaction,
) => {
	try {
		const whereClause = buildPromotionWhereClause(data);

		const promotion = await db.promotions.findOne({
			where: whereClause,
			include: [{ model: db.productPromotions }],
			transaction,
		});

		return { promotion };
	} catch (error) {
		throw new Error(`Failed to get promotion: ${error.message}`);
	}
};

/**
 * Create product promotion with associations
 */
export const createProductPromotion = async (
	productIds: number[],
	data: any,
	transaction?: Transaction,
) => {
	try {
		validatePromotionData(data);
		validateProductIds(productIds);
		await checkProductsExist(productIds, transaction);

		const promotion = await db.promotions.create(data, { transaction });

		for (const productId of productIds) {
			await db.productPromotions.create(
				{ productId, promotionId: promotion.id },
				{ transaction },
			);
		}

		return await db.promotions.findByPk(promotion.id, {
			include: [
				{
					model: db.productPromotions,
					include: [{ model: db.products }],
				},
			],
			transaction,
		});
	} catch (error) {
		throw new Error(`Failed to create promotion: ${error.message}`);
	}
};

/**
 * Update promotion by ID
 */
export const updatePromotion = async (
	promotionId: number,
	data: any,
	transaction?: Transaction,
) => {
	try {
		const promotion = await db.promotions.findByPk(promotionId, {
			transaction,
		});

		if (!promotion) {
			throw new Error('Promotion not found');
		}

		await promotion.update(data, { transaction });
		return promotion;
	} catch (error) {
		throw new Error(`Failed to update promotion: ${error.message}`);
	}
};

/**
 * Delete product promotion and its associations
 */
export const deleteProductPromotion = async (
	id: number,
	transaction?: Transaction,
) => {
	try {
		await db.productPromotions.destroy({
			where: { promotionId: id },
			transaction,
		});

		return db.promotions.destroy({
			where: { id: id },
			transaction,
		});
	} catch (error) {
		throw new Error(`Failed to delete promotion: ${error.message}`);
	}
};
