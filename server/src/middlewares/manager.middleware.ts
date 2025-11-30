import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { PERMISSION_ERROR } from '../constants/error.constant';
import { AppError } from '../../utility/app.error.util';

export enum RoleManager {
	super_admin = 'super_admin',
	manager = 'manager',
	staff = 'staff',
}

export const authorization = (roles: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const user = (req as any).user as any;
			if (!user) {
				throw new AppError(PERMISSION_ERROR, 'User not found');
			}
			if (user.role === RoleManager.super_admin) {
				return next();
			}

			if (!roles.includes(user.role)) {
				throw new AppError(PERMISSION_ERROR, 'Unauthority');
			}
			next();
		} catch (error) {
			next(error);
		}
	};
};
