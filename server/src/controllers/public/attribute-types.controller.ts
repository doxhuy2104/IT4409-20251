import { NextFunction, Request, Response } from 'express';
import { db } from '../../loaders/database.loader';
import { ResOk } from '../../utility/response.util';

export const getAttributeByCategoryId = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const categoryId = parseInt(req.params.categoryId, 10) || 0;
		const variantId = req.query.variantId
			? parseInt((req as any).query.variantId)
			: null;
		let include: any[] = [
			{
				model: db.attributeTypes,
				required: false,
				as: 'subAttributes',
			},
		];

		if (variantId) {
			include[0].include = [
				{
					model: db.variantAttributes,
					include: [
						{ model: db.attributeValues },
						{
							model: db.productVariants,
							where: {
								id: variantId,
							},
						},
					],
				},
			];
			include.push({
				model: db.variantAttributes,
				include: [
					{ model: db.attributeValues },
					{
						model: db.productVariants,
						where: {
							id: variantId,
						},
					},
				],
			});
		}

		const attributeTypes = await db.attributeTypes.findAll({
			where: {
				categoryId,
			},
			include,
		});
		return res.status(200).json(new ResOk().formatResponse(attributeTypes));
	} catch (e) {
		next(e);
	}
};
