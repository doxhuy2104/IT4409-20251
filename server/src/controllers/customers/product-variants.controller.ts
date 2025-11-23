import { Request, Response, NextFunction } from 'express';
import { ResOk } from '../../../utility/response.util';
import * as variantService from '../../services/customers/product-variants.service';
import { db } from '../../loaders/database.loader';

export const getVariants = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const {
			id = '',
			name = '',
			productId,
			min = 0,
			max,
			minDiscount = 0,
			maxDiscount,
			stock = 0,
			include = '',
			page = 1, // Mặc định trang 1
			limit = 20, // Mặc định số sản phẩm trên mỗi trang là 20
		} = req.query;

		// Tính toán phạm vi phân trang
		const offset =
			(parseInt(page as string) - 1) * parseInt(limit as string);
		const pageLimit = parseInt(limit as string);

		const filters = {
			id: id ? Number(id) : undefined,
			name: name as string,
			productId: productId ? Number(productId) : undefined,
			priceRange: {
				min: parseFloat(min as string),
				max: max ? parseFloat(max as string) : Number.MAX_SAFE_INTEGER,
			},
			discountPriceRange: {
				min: parseFloat(minDiscount as string),
				max: maxDiscount
					? parseFloat(maxDiscount as string)
					: Number.MAX_SAFE_INTEGER,
			},
			stock: stock ? Number(stock) : undefined,
			include: (include as string)?.split(','),
			offset,
			page: parseInt(page as string),
			limit: pageLimit,
		};

		const [rows, count] = await variantService.getVariants(
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
