import { JSONSchemaType } from 'ajv';
import { ajv } from '../validators';
import * as express from 'express';
import { BAD_REQUEST, SYSTEM_ERROR } from '../constants/error.constant';
import { AppError } from '../../utility/app.error.util';

export function validateBody<T>(schema: JSONSchemaType<T>) {
	return (
		req: express.Request,
		res: express.Response,
		next: express.NextFunction,
	) => {
		try {
			const validateCreate = ajv.compile(schema);
			const result = validateCreate(req.body);
			if (!result) {
				const messages =
					validateCreate.errors;

				res.status(BAD_REQUEST).json(messages);
			} else {
				next();
			}
		} catch (error: unknown) {
			const message = (error as Error).message;
			next(new AppError(SYSTEM_ERROR, message));
		}
	};
}
