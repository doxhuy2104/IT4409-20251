import { NextFunction, Request, Response } from 'express';
import { db } from '../../loaders/database.loader';
import { ResOk } from '../../utility/response.util';
import { Op } from 'sequelize';

export const getAttributeValuesByAttributeId = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const keyword = req.query.keyword as string;
		const attributeTypeId = parseInt(req.params.attributeTypeId, 10) || 0;
		const attributeValues = await db.attributeValues.findAll({
			where: {
				attributeTypeId,
				...(keyword && {
					value: {
						[Op.like]: `%${keyword}%`,
					},
				}),
			},
			attributes: ['id', 'value'],
			limit: parseInt(req.query.limit as string, 10) || 10,
			offset: parseInt(req.query.offset as string, 10) || 0,
		});
		return res
			.status(200)
			.json(new ResOk().formatResponse(attributeValues));
	} catch (e) {
		next(e);
	}
};
