import { db } from '../../loaders/database.loader';
import { Transaction } from 'sequelize';

/**
 * Interface for feedback creation data
 */
interface CreateFeedbackData {
	content: string;
	rating?: number;
	productId?: number;
	orderId?: number;
}

/**
 * Validate feedback content
 */
const validateFeedbackContent = (content: string): void => {
	if (!content || content.trim().length === 0) {
		throw new Error('Feedback content is required');
	}
	if (content.length > 1000) {
		throw new Error('Feedback content too long');
	}
};

/**
 * Validate rating value
 */
const validateRating = (rating?: number): void => {
	if (rating !== undefined && (rating < 1 || rating > 5)) {
		throw new Error('Rating must be between 1 and 5');
	}
};

/**
 * Check if customer exists
 */
const checkCustomerExists = async (
	customerId: number,
	transaction?: Transaction,
): Promise<void> => {
	const customer = await db.customers.findByPk(customerId, { transaction });
	if (!customer) {
		throw new Error('Customer not found');
	}
};

/**
 * Format feedback data before creation
 */
const formatFeedbackData = (
	customerId: number,
	data: CreateFeedbackData,
): any => {
	return {
		...data,
		userId: customerId,
		content: data.content.trim(),
	};
};

/**
 * Get all feedbacks with customer information
 */
export const getAllFeedbacks = async (transaction?: Transaction) => {
	try {
		return await db.feedbacks.findAll({
			include: [
				{ model: db.customers, attributes: { exclude: ['passwordHash'] } },
			],
			transaction,
		});
	} catch (error) {
		throw new Error(`Failed to get feedbacks: ${error.message}`);
	}
};

/**
 * Get feedback by ID
 */
export const getFeedbackById = async (
	id: number,
	transaction?: Transaction,
) => {
	const feedback = await db.feedbacks.findByPk(id, {
		include: [
			{ model: db.customers, attributes: { exclude: ['passwordHash'] } },
		],
		transaction,
	});
	if (!feedback) {
		throw new Error('Feedback not found');
	}
	return feedback;
};

/**
 * Create new feedback with validation
 */
export const createFeedback = async (
	customerId: number,
	data: CreateFeedbackData,
	transaction?: Transaction,
) => {
	try {
		validateFeedbackContent(data.content);
		validateRating(data.rating);
		await checkCustomerExists(customerId, transaction);

		const feedbackData = formatFeedbackData(customerId, data);
		return await db.feedbacks.create(feedbackData, { transaction });
	} catch (error) {
		throw new Error(`Failed to create feedback: ${error.message}`);
	}
};

/**
 * Delete feedback by ID
 */
export const deleteFeedback = async (id: number, transaction?: Transaction) => {
	const feedback = await db.feedbacks.findByPk(id, { transaction });
	if (!feedback) {
		throw new Error('Feedback not found');
	}
	return await feedback.destroy({ transaction });
};
