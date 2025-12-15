import { Request, Response, NextFunction } from 'express';
import { db } from '../../loaders/database.loader';
import { ResOk } from '../../utility/response.util';
import { Admins } from '../../models/admins.model';
import * as adminLogService from '../../services/managers/admin-logs.service';
import * as imageService from '../../services/managers/product-images.service';

export const uploadProductImage = async (req: Request, res: Response) => {
	try {
		await imageService.uploadProductImage(req, res); // Gọi trực tiếp service xử lý upload
	} catch (error) {
		console.error('Error in uploadProductImageController:', error);
		return res.status(500).json({
			error: 'Internal server error while uploading product image',
		});
	}
};

export const getProductImages = async (req: Request, res: Response) => {
	const productId = parseInt(req.params.productId);
	try {
		const images = await imageService.getProductImages(productId);
		if (!images || images.length === 0) {
			return res
				.status(404)
				.json({ message: 'No images found for this product' });
		}
		return res.status(200).json(images);
	} catch (error) {
		console.error('Error in getProductImagesController:', error);
		return res.status(500).json({ error: 'Error fetching product images' });
	}
};

export const deleteProductImage = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const transaction = await db.sequelize.transaction();
	try {
		const id = Number(req.params.id);
		const image = await db.productImages.findByPk(id, { transaction });

		if (!image) {
			return res.status(404).json({ message: 'Product image not found' });
		}

		// Nếu ảnh bị xóa là primary
		if (image.isPrimary) {
			// 1. Lấy danh sách ảnh liên quan
			let relatedImages = await imageService.getProductImages(
				image.productId,
				transaction,
			);

			// 2. Loại bỏ chính ảnh đang bị xoá ra khỏi danh sách
			relatedImages = relatedImages.filter((img) => img.id !== id);

			// 3. Xóa ảnh
			await image.destroy({ transaction });

			// 4. Gán ảnh đầu tiên còn lại làm primary nếu có
			if (relatedImages.length > 0) {
				await relatedImages[0].update(
					{ isPrimary: true },
					{ transaction },
				);
			}
		} else {
			await image.destroy({ transaction });
		}

		// Ghi adminlog
		await adminLogService.CreateAdminLog(
			(req.user as Admins).id,
			'Delete',
			parseInt(req.params.id),
			'Image',
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
