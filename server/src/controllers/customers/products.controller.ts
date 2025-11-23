import { Request, Response, NextFunction } from 'express';
import { ResOk } from '../../../utility/response.util';
import * as productService from '../../services/customers/products.service';
import { db } from '../../loaders/database.loader';

// Lấy sản phẩm với phân trang
export const getProducts = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const {
			id = '',
			name = '',
			slug = '',
			brandId = '',
			categoryId = '',
			min = 0,
			max,
			include = '',
			direct = '',
			page = 1, 
			limit = 20,
		} = req.query;

		// Tính toán phạm vi phân trang
		const offset =
			(parseInt(page as string) - 1) * parseInt(limit as string);
		const pageLimit = parseInt(limit as string);

		const order = direct ? [['basePrice', direct]] : [];

		const filters = {
			id: id ? Number(id) : undefined,
			name: name as string,
			slug: slug as string,
			brandId: brandId ? Number(brandId) : undefined,
			categoryId: categoryId ? Number(categoryId) : undefined,
			priceRange: {
				min: parseFloat(min as string),
				max: max ? parseFloat(max as string) : Number.MAX_SAFE_INTEGER,
			},
			order,
			include: (include as string)?.split(','),
			offset,
			page: parseInt(page as string),
			limit: pageLimit,
		};

		const [rows, count] = await productService.getProducts(
			filters,
			transaction,
		);
		await transaction.commit();
		return res
			.status(200)
			.json(
				new ResOk().formatResponse(
					rows,
					'Products retrieved successfully',
					200,
					filters.limit,
					filters.page,
					count as any,
				),
			);
	} catch (error) {
		await transaction.rollback();
		next(error);
	}
};
