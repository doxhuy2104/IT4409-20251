import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';

interface ErrorInterface extends Error {
	statusCode?: number;
}

export const handleError = (
	error: ErrorInterface,
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	console.error('error', error);
	const responseData = {
		code: error.statusCode || HttpStatusCode.InternalServerError,
		message:
			error.statusCode === HttpStatusCode.InternalServerError
				? 'Internal Server Error'
				: error.message,
	};

	return res.status(responseData.code).json(responseData);
};
