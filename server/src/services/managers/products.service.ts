import { Transaction } from 'sequelize';
import { db } from '../../loaders/database.loader';
import { createSlug } from '../../../utility/string.util';

export const createProduct = async (data: any, transaction?: Transaction) => {
	const newProduct = await db.products.create(
		{
			...data,
			categoryId: parseInt(data.categoryId, 10),
			brandId: parseInt(data.brandId, 10),
			price: parseFloat(data.price || 0),
			stock: parseInt(data.stock || 0, 10),
			slug: data.slug || createSlug(data.name || ''),
		},
		{ transaction },
	);

	return { newProduct };
};

// Cập nhật sản phẩm
export const updateProduct = async (
	id: number,
	data: any,
	transaction?: Transaction,
) => {
	const product = await db.products.findByPk(id, { transaction });
	if (!product) return null;

	const slug = data.slug || createSlug(data.name || '');
	// Cập nhật thông tin sản phẩm
	await product.update({ ...data, slug }, { transaction });
	return product;
};

export const deleteProduct = async (id: string, transaction?: Transaction) => {
	return db.products.destroy({ where: { id }, transaction });
};
