import { db } from '../../loaders/database.loader';
import { Transaction } from 'sequelize';

export const createReview = async (
	customerId: number,
	data: any,
	transaction?: Transaction,
) => {
	const review = {
		...data,
		customerId,
		isApproved: false,
	};
	const res = await db.reviews.create(review, { transaction });

	const resReview = await db.reviews.findOne({
		where: { id: res.id },
		include: [{ model: db.products }],
		transaction,
	});

	return resReview;
};

export const getAllReviews = async (transaction?: Transaction) => {
	return await db.reviews.findAll({
		include: [{ model: db.products }],
		transaction,
	});
};

export const getReviewsByProduct = async (
	productId: number,
	transaction?: Transaction,
) => {
	return await db.reviews.findAll({
		where: { productId },
		include: [{ model: db.products }],
		transaction,
	});
};

export const updateReview = async (
	id: number,
	customerId: number,
	data: any,
	transaction?: Transaction,
) => {
	const review = await db.reviews.findOne({
		where: { id, customerId },
		transaction,
	});
	if (!review) throw new Error('Review not found');
	const dataReview = {
		...data,
		isApproved: false,
	};
	await review.update(dataReview, { transaction });
	const res = await db.reviews.findOne({
		where: { id: id },
		include: [{ model: db.products }],
		transaction,
	});
	return res;
};

export const deleteReview = async (
	id: number,
	customerId: number,
	transaction?: Transaction,
) => {
	const review = await db.reviews.findOne({
		where: { id: id, customerId: customerId },
		transaction,
	});
	if (!review) throw new Error('Review not found');
	return await review.destroy({ transaction });
};
