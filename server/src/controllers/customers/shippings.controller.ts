import { Request, Response, NextFunction } from 'express';
import { ResOk } from '../../../utility/response.util';
import * as shippingService from '../../services/customers/shippings.service';
import { db } from '../../loaders/database.loader';

export const updateShipping = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const id = parseInt(req.params.id);
		const customerId = (req as any).user.id;
		const updateShipping = await shippingService.updateShipping(
			id,
			customerId,
			req.body,
			transaction,
		);
		await transaction.commit();
		return res.status(200).json(new ResOk().formatResponse(updateShipping));
	} catch (error) {
		await transaction.rollback();
		next(error);
	}
};
