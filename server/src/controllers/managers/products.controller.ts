import { Request, Response, NextFunction } from 'express';
import { ResOk } from '../../utility/response.util';
import * as productService from '../../services/managers/products.service';
import * as productImageService from '../../services/managers/product-images.service';
import { db } from '../../loaders/database.loader';
import { Admins } from '../../models/admins.model';
import * as adminLogService from '../../services/managers/admin-log.service';

// Tạo sản phẩm mới
export const createProduct = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const files = req.files as Express.Multer.File[];

		const { newProduct } = await productService.createProduct(
			req.body,
			transaction,
		);

		const images = await productImageService.createProductImages(
			files,
			newProduct.id,
			transaction,
		);

		// Ghi adminlog
		await adminLogService.CreateAdminLog(
			(req.user as Admins).id,
			'Create',
			newProduct.id,
			'Product',
			req.body,
			transaction,
		);

		await transaction.commit();
		return res.status(201).json(
			new ResOk().formatResponse({
				product: newProduct,
				images,
			}),
		);
	} catch (error) {
		await transaction.rollback();
		next(error);
	}
};

// Cập nhật sản phẩm
export const updateProduct = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const updatedProduct = await productService.updateProduct(
			Number(req.params.id),
			req.body,
			transaction,
		);

		const files = req.files as Express.Multer.File[];

		if (!updatedProduct) {
			await transaction.rollback();
			return res.status(404).json({ message: 'Product not found' });
		}

		await productImageService.createProductImages(
			files,
			updatedProduct.id,
			transaction,
		);

		// Ghi adminlog
		await adminLogService.CreateAdminLog(
			(req.user as Admins).id,
			'Update',
			updatedProduct.id,
			'Product',
			req.body,
			transaction,
		);

		await transaction.commit();
		return res.status(200).json(new ResOk().formatResponse(updatedProduct));
	} catch (error) {
		await transaction.rollback();
		next(error);
	}
};

// Xoá sản phẩm
export const deleteProduct = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const productId = req.params.id;
		const product = await db.products.findByPk(productId, {
			transaction,
		});

		if (!product) {
			return res.status(404).json({ message: 'Product not found' });
		}

		product.isHidden = true;
		await product.save({ transaction });

		await adminLogService.CreateAdminLog(
			(req.user as Admins).id,
			'Hidden',
			parseInt(req.params.id),
			'Product',
			{ deleted: true },
			transaction,
		);

		await transaction.commit();
		return res
			.status(200)
			.json(
				new ResOk().formatResponse({ message: 'Deleted successfully' }),
			);
	} catch (error) {
		await transaction.rollback();
		next(error);
	}
};
