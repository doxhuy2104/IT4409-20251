import { db } from '../../loaders/database.loader';
import { Transaction, Op } from 'sequelize';

export const applyPromotion = async (
	promotionId: number,
	orderId: number,
	transaction?: Transaction,
) => {
	const promotion = await db.promotions.findByPk(promotionId, {
		transaction,
	});
	const order = await db.orders.findByPk(orderId, {
		include: [
			{
				model: db.orderItems,
				include: [
					{
						model: db.products,
						include: [{ model: db.productImages }],
					},
				],
			},
		],
		transaction,
	});
	if (!promotion) return null;
	if (!order) return null;

	if (!promotion.isActive || promotion.isDeleted || promotion.isExpired)
		return order?.totalAmount;

	const now = new Date();
	if (now < promotion.startDate || now > promotion.endDate)
		return order?.totalAmount;

	if (
		promotion.minimumPurchaseAmount &&
		order?.totalAmount < +promotion.minimumPurchaseAmount
	)
		return order?.totalAmount;

	if (
		promotion.usageLimit !== null &&
		promotion.usageCount >= promotion.usageLimit
	)
		return order?.totalAmount;

	let discountedAmount = order?.totalAmount;

	if (promotion.discountPercent) {
		const rawDiscount =
			order?.totalAmount * (+promotion.discountPercent / 100);
		const maxDiscount = promotion.maximumDiscountAmount
			? +promotion.maximumDiscountAmount
			: rawDiscount;
		discountedAmount -= Math.min(rawDiscount, maxDiscount);
	} else if (promotion.discountAmount) {
		discountedAmount -= +promotion.discountAmount;
	}

	// Không để giá âm
	if (discountedAmount < 0) discountedAmount = 0;

	return parseFloat(discountedAmount.toFixed(2));
};
