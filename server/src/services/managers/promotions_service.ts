import { db } from '../../loaders/database.loader';
import { Transaction, Op } from 'sequelize';

/**
 * Check if promotion is valid for use
 */
const isPromotionValid = (promotion: any): boolean => {
	if (!promotion.isActive || promotion.isDeleted || promotion.isExpired) {
		return false;
	}

	const now = new Date();
	if (now < promotion.startDate || now > promotion.endDate) {
		return false;
	}

	if (
		promotion.usageLimit !== null &&
		promotion.usageCount >= promotion.usageLimit
	) {
		return false;
	}

	return true;
};

/**
 * Check if order meets minimum purchase amount
 */
const checkMinimumPurchase = (
	promotion: any,
	orderAmount: number,
): boolean => {
	if (
		promotion.minimumPurchaseAmount &&
		orderAmount < +promotion.minimumPurchaseAmount
	) {
		return false;
	}
	return true;
};

/**
 * Calculate discount from percentage
 */
const calculatePercentageDiscount = (
	orderAmount: number,
	discountPercent: number,
	maximumDiscount?: number,
): number => {
	const rawDiscount = orderAmount * (+discountPercent / 100);
	const maxDiscount = maximumDiscount ? +maximumDiscount : rawDiscount;
	return Math.min(rawDiscount, maxDiscount);
};

/**
 * Calculate final discounted amount
 */
const calculateDiscountedAmount = (
	originalAmount: number,
	discountValue: number,
): number => {
	let discountedAmount = originalAmount - discountValue;
	if (discountedAmount < 0) discountedAmount = 0;
	return parseFloat(discountedAmount.toFixed(2));
};

/**
 * Get order with full details
 */
const getOrderDetails = async (
	orderId: number,
	transaction?: Transaction,
): Promise<any> => {
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

	if (!order) {
		throw new Error('Order not found');
	}

	return order;
};

/**
 * Apply promotion to order and calculate discount
 */
export const applyPromotion = async (
	promotionId: number,
	orderId: number,
	transaction?: Transaction,
): Promise<number> => {
	try {
		const promotion = await db.promotions.findByPk(promotionId, {
			transaction,
		});

		const order = await getOrderDetails(orderId, transaction);

		if (!promotion) return order?.totalAmount;
		if (!order) return null;

		if (!isPromotionValid(promotion)) {
			return order?.totalAmount;
		}

		if (!checkMinimumPurchase(promotion, order?.totalAmount)) {
			return order?.totalAmount;
		}

		let discountedAmount = order?.totalAmount;

		if (promotion.discountPercent) {
			const discount = calculatePercentageDiscount(
				order?.totalAmount,
				+promotion.discountPercent,
				promotion.maximumDiscountAmount,
			);
			discountedAmount -= discount;
		} else if (promotion.discountAmount) {
			discountedAmount -= +promotion.discountAmount;
		}

		return calculateDiscountedAmount(order?.totalAmount, discountedAmount);
	} catch (error) {
		throw new Error(`Failed to apply promotion: ${error.message}`);
	}
};
