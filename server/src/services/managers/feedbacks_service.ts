import { db } from '../../loaders/database.loader';
import { Transaction } from 'sequelize';

export const getAllFeedbacks = async (transaction?: Transaction) => {
	return await db.feedbacks.findAll({
		include: [
			{ model: db.customers, attributes: { exclude: ['passwordHash'] } },
		],
		transaction,
	});
};

export const createFeedback = async (
	customerId: number,
	data: any,
	transaction?: Transaction,
) => {
	const feedback = {
		...data,
		userId: customerId,
	};
	return await db.feedbacks.create(feedback, { transaction });
};

export const deleteFeedback = async (id: number, transaction?: Transaction) => {
	const feedback = await db.feedbacks.findByPk(id, { transaction });
	if (!feedback) throw new Error('feedback not found');
	return await feedback.destroy({ transaction });
};
