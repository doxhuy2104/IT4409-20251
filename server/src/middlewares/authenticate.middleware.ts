import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { BAD_REQUEST, PERMISSION_ERROR } from '../constants/errorConstant';
import { AppError } from '../../utility/appError.util';
import env from '../../env';
import { db } from '../loaders/database.loader';
import { Customers } from '../models/customers.model';

export const isManager = async (
	req: any,
	res: Response,
	next: NextFunction,
) => {
	try {
		(req as any).isAdmin = true;
		next();
	} catch (error) {
		next(error);
	}
};

export const verifyToken = async (
	req: any,
	res: Response,
	next: NextFunction,
) => {
	try {
		const isAdmin = (req as any).isAdmin;
		const token = req.header('Authorization')?.replace('Bearer ', '');
		if (!token) {
			throw new AppError(PERMISSION_ERROR, 'Unauthenticated!');
		}
		const jwtSecret: string = isAdmin
			? env.app.jwtSecretManager
			: env.app.jwtSecret;
		const payload: any = jwt.verify(token, jwtSecret);
		const user = isAdmin
			? await db.admins.findOne({
					where: { id: payload.id, email: payload.email },
					attributes: { exclude: ['passwordHash'] },
			  })
			: await db.customers.findOne({
					where: { id: payload.id, email: payload.email },
					attributes: { exclude: ['passwordHash'] },
			  });
		if (!user || !user.isActive) {
			throw new AppError(PERMISSION_ERROR, 'Unauthenticated!');
		}
		if (!isAdmin && (user as Customers).isBlock) {
			throw new AppError(BAD_REQUEST, 'User is blocked');
		}
		(req as any).user = user;
		next();
	} catch (error) {
		next(error);
	}
};
