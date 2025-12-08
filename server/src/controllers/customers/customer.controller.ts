import { NextFunction, Request, Response } from 'express';
import { ResOk } from '../../../utility/response.util';
import { RESPONSE_SUCCESS } from '../../constants/error.constant';
import * as customersService from '../../services/customers/customer.service';
export const updateProfile = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const id = (req as any).user.id;
		const { fullName, email, phone, address } = req.body;
		const user = await customersService.updateProfile(id, {
			fullName,
			email,
			phone,
			address,
		});
		return res
			.status(RESPONSE_SUCCESS)
			.json(
				new ResOk().formatResponse(
					user,
					'User information',
					RESPONSE_SUCCESS,
				),
			);
	} catch (error) {
		next(error);
	}
};
