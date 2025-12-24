import { Request, Response, NextFunction } from 'express';
import { ResOk } from '../../utility/response.util';
import * as dashboardService from '../../services/managers/dashboard.service';
import { db } from '../../loaders/database.loader';

export const getAllDashboard = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const feedbacks = await dashboardService.getAllDashboard(transaction);
		await transaction.commit();
		return res.status(200).json(new ResOk().formatResponse(feedbacks));
	} catch (error) {
		await transaction.rollback();
		next(error);
	}
};
