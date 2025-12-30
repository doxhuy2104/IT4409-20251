
import { db } from '../../loaders/database.loader';
import { Transaction } from 'sequelize';
import { cloudinary } from 'utility/cloudinary.util'; 

// Tạo nhiều ảnh sản phẩm mới (upload từ Cloudinary, files có public_id & path)
export const createProductImages = async (
	files: any[],
	productId: number,
	transaction?: Transaction,
) => {
	try {
		const fileCreates = files.map((file) => ({
			productId,
			publicId: file.publicId || file.public_id || '',
			imageUrl: file.path || file.secure_url || '',
			isPrimary: false, // luôn để false, sau này có thể set bằng API riêng
		}));

		return await db.productImages.bulkCreate(fileCreates, {
			returning: true,
			transaction,
		});
	} catch (error) {
		console.error('Error creating product images:', error);
		throw new Error('Error creating product images');
	}
};

// Upload một ảnh mới cho product
export const uploadProductImage = async (
	req: any,
	res: any,
	transaction?: Transaction,
) => {
	const { productId } = req.body;
	const file = req.file;
	const isPrimary =
		req.body.isPrimary === 'true' || req.body.isPrimary === true;

	if (!file || !file.public_id || !file.path) {
		return res.status(400).json({ error: 'Invalid image file uploaded' });
	}

	if (!productId) {
		return res.status(400).json({ error: 'Missing productId' });
	}

	try {
		const productImage = await db.productImages.create(
			{
				productId,
				publicId: file.public_id,
				imageUrl: file.path,
				isPrimary,
			},
			{ transaction },
		);

		return res.status(201).json(productImage);
	} catch (error) {
		console.error('Error saving product image:', error);
		return res
			.status(500)
			.json({ error: 'Error saving product image to database' });
	}
};

// Lấy ảnh sản phẩm theo productId
export const getProductImages = async (
	productId: number,
	transaction?: Transaction,
) => {
	try {
		return await db.productImages.findAll({
			where: { productId },
			transaction,
		});
	} catch (error) {
		console.error('Error fetching product images:', error);
		throw new Error('Error fetching product images');
	}
};

// Xóa ảnh sản phẩm cả trên Cloudinary và DB
export const deleteProductImage = async (
	id: number,
	transaction?: Transaction,
) => {
	try {
		// Tìm ảnh cần xóa
		const productImage = await db.productImages.findByPk(id, {
			transaction,
		});

		if (!productImage) {
			console.warn(`Image with id=${id} not found`);
			return null;
		}

		// Xóa ảnh trên Cloudinary nếu có publicId
		if (productImage.publicId) {
			try {
				const result = await cloudinary.uploader.destroy(
					productImage.publicId,
				);

				if (result.result !== 'ok' && result.result !== 'not found') {
					console.warn(
						`Cloudinary delete failed: ${result.result} (publicId=${productImage.publicId})`,
					);
				}
			} catch (cloudError) {
				console.error('Error deleting from Cloudinary:', cloudError);
				// không throw tại đây để tiếp tục xóa DB
			}
		} else {
			console.warn(
				`Image id=${id} has no publicId, skipping Cloudinary delete`,
			);
		}

		// Xóa bản ghi trong database
		await productImage.destroy({ transaction });

		console.log(`Image id=${id} deleted from DB`);
		return productImage;
	} catch (error) {
		console.error('Error in deleteProductImage:', error);
		throw new Error('Failed to delete product image');
	}
};
