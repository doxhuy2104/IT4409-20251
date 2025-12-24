import { db } from '../../loaders/database.loader';
import { Transaction, Op } from 'sequelize';

export const getPromotion = async (data: any, transaction?: Transaction) => {
	// Tạo đối tượng điều kiện where để lọc
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

	// Truy vấn khuyến mãi
	const promotion = await db.promotions.findOne({
		where: whereClause,
		include: [{ model: db.productPromotions }],
		transaction,
	});
	return {
		promotion,
	};
};

export const createProductPromotion = async (
	productIds: number[],
	data: any,
	transaction?: Transaction,
) => {
	const promotion = await db.promotions.create(data, { transaction });

	// Lặp qua từng productId và tạo bản ghi productPromotion
	for (const productId of productIds) {
		await db.productPromotions.create(
			{ productId, promotionId: promotion.id },
			{ transaction },
		);
	}

	// Trả về promotion kèm theo danh sách sản phẩm liên quan
	return await db.promotions.findByPk(promotion.id, {
		include: [
			{
				model: db.productPromotions,
				include: [{ model: db.products }],
			},
		],
		transaction,
	});
};

export const updatePromotion = async (
	promotionId: number,
	data: any,
	transaction?: Transaction,
) => {
	const promotion = await db.promotions.findByPk(promotionId, {
		transaction,
	});
	if (!promotion) return null;

	await promotion.update(data, { transaction });
	return promotion;
};

export const deleteProductPromotion = async (
	id: number,
	transaction?: Transaction,
) => {
	db.productPromotions.destroy({
		where: { promotionId: id },
		transaction,
	});
	return db.promotions.destroy({
		where: { id: id },
		transaction,
	});
};
