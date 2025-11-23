import { NextFunction, Request, Response } from 'express';
import { db } from '../../loaders/database.loader';
import { ResOk } from '../../utility/response.util';

export const getCategories = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const categories = await db.categories.findAll({
			where: {
				parentId: null,
			},
			include: [
				{
					model: db.categories,
					required: false,
					as: 'subCategories',
					include: [
						{
							model: db.categories,
							required: false,
							as: 'subCategories',
						},
					],
				},
			],
		});
		return res.status(200).json(new ResOk().formatResponse(categories));
	} catch (e) {
		next(e);
	}
};
