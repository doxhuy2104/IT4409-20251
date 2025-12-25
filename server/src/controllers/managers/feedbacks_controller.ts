import { Request, Response, NextFunction } from 'express';
import { ResOk } from '../../utility/response.util';
import * as feedbackService from '../../services/managers/feedbacks.service';
import { db } from '../../loaders/database.loader';
import { Admins } from '../../models/admins.model';
import * as adminLogService from '../../services/managers/admin-logs.service';

/**
 * Validate feedback ID
 */
const validateFeedbackId = (id: any): number => {
	const feedbackId = Number(id);
	if (isNaN(feedbackId) || feedbackId <= 0) {
		throw new Error('Invalid feedback ID');
	}
	return feedbackId;
};

/**
 * Validate customer ID
 */
const validateCustomerId = (id: any): number => {
	const customerId = Number(id);
	if (isNaN(customerId) || customerId <= 0) {
		throw new Error('Invalid customer ID');
	}
	return customerId;
};

/**
 * Validate feedback data
 */
const validateFeedbackData = (data: any): void => {
	if (!data.name || data.name.trim().length === 0) {
		throw new Error('Feedback name is required');
	}
	if (!data.description || data.description.trim().length === 0) {
		throw new Error('Feedback description is required');
	}
	if (data.name.length > 200) {
		throw new Error('Feedback name is too long');
	}
	if (data.description.length > 1000) {
		throw new Error('Feedback description is too long');
	}
};

/**
 * Sanitize feedback input
 */
const sanitizeFeedbackData = (data: any): any => {
	return {
		...data,
		name: data.name?.trim(),
		description: data.description?.trim(),
	};
};

/**
 * Check if user has permission
 */
const checkUserPermission = (req: Request, feedbackId: number): boolean => {
	const user = (req as any).user;
	if (!user) return false;
	return true;
};

/**
 * Get all feedbacks
 */
export const getAllfeedbacks = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const feedbacks = await feedbackService.getAllFeedbacks(transaction);
		
		if (!feedbacks) {
			await transaction.commit();
			return res.status(200).json(new ResOk().formatResponse([]));
		}

		await transaction.commit();
		return res.status(200).json(new ResOk().formatResponse(feedbacks));
	} catch (error) {
		await transaction.rollback();
		console.error('Error fetching feedbacks:', error);
		next(error);
	}
};

/**
 * Create new feedback
 */
export const createfeedback = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const customerId = validateCustomerId((req as any).user.id);
		const sanitizedData = sanitizeFeedbackData(req.body);
		
		validateFeedbackData(sanitizedData);

		const feedback = await feedbackService.createFeedback(
			customerId,
			sanitizedData,
			transaction,
		);

		if (!feedback) {
			throw new Error('Failed to create feedback');
		}

		await transaction.commit();
		return res.status(201).json(new ResOk().formatResponse(feedback));
	} catch (error) {
		await transaction.rollback();
		console.error('Error creating feedback:', error);
		next(error);
	}
};

/**
 * Delete feedback by ID
 */
export const deletefeedback = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const feedbackId = validateFeedbackId(req.params.id);

		if (!checkUserPermission(req, feedbackId)) {
			await transaction.rollback();
			return res.status(403).json({ message: 'Permission denied' });
		}

		const deleted = await feedbackService.deleteFeedback(
			feedbackId,
			transaction,
		);

		if (!deleted) {
			await transaction.rollback();
			return res.status(404).json({ message: 'Feedback not found' });
		}

		await adminLogService.CreateAdminLog(
			(req.user as Admins).id,
			'Delete',
			feedbackId,
			'Feedback',
			{ deleted: true },
			transaction,
		);

		await transaction.commit();
		return res.status(200).json(
			new ResOk().formatResponse({ message: 'Deleted successfully' })
		);
	} catch (error) {
		await transaction.rollback();
		console.error('Error deleting feedback:', error);
		next(error);
	}
};
