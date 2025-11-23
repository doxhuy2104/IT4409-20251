import { NextFunction, Request, Response } from 'express';
import { db } from '../../loaders/database.loader';
import { ResOk } from '../../utility/response.util';

export const getBrands = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const brands = await db.brands.findAll();
		return res.status(200).json(new ResOk().formatResponse(brands));
	} catch (e) {
		next(e);
	}
};

export const getBrandsByCategoryId = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { categoryId } = req.params;
		const categoryIdInt = parseInt(categoryId);

		// Tìm tất cả brands có liên kết với category có id = categoryId
		const brands = await db.brands.findAll({
			include: [
				{
					model: db.categories,
					attributes: [], // Không lấy thông tin của categories
					through: {
						attributes: [], // Không lấy thông tin của bảng trung gian
					},
					where: {
						id: categoryIdInt,
					},
				},
			],
		});

		return res.status(200).json(new ResOk().formatResponse(brands));
	} catch (e) {
		next(e);
	}
};
