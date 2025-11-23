import { Op, Transaction } from 'sequelize';
import { db } from '../../loaders/database.loader';

// Lấy tất cả biến thể sản phẩm
export const getVariants = async (filters: any, transaction?: Transaction) => {
	const where: any = {};
	const include: any[] = [
		{
			model: db.variantAttributes,
			include: [{ model: db.attributeValues }],
		},
		{ model: db.productImages },
		{ model: db.products },
	];

	// Điều kiện lọc theo id biến thể sản phẩm
	if (filters.id) {
		where.id = filters.id;
	}

	if (filters.name) {
		where.name = { [Op.like]: `%${filters.name}%` };
	}

	// Điều kiện lọc theo id sản phẩm
	if (filters.productId) {
		where.productId = filters.productId;
	}

	// Điều kiện lọc nếu còn hàng
	if (filters.stock !== undefined) {
		where.stock = { [Op.gte]: filters.stock };
	}

	// Điều kiện lọc theo khoảng giá
	if (filters.priceRange.min || filters.priceRange.max) {
		where.price = {};
		if (filters.priceRange.min)
			where.price[Op.gte] = filters.priceRange.min;
		if (filters.priceRange.max)
			where.price[Op.lte] = filters.priceRange.max;
	}
	// Điều kiện lọc theo khoảng giá khuyến mãi
	if (filters.discountPriceRange.min || filters.discountPriceRange.max) {
		where.discountPrice = {};
		if (filters.discountPriceRange.min)
			where.discountPrice[Op.gte] = filters.discountPriceRange.min;
		if (filters.discountPriceRange.max)
			where.discountPrice[Op.lte] = filters.discountPriceRange.max;
	}

	// Lấy dữ liệu từ cơ sở dữ liệu với phân trang
	const [rows, count] = await Promise.all([
		db.productVariants.findAll({
			where,
			include,
			limit: filters.limit,
			offset: filters.offset,
			transaction,
		}),
		db.productVariants.count({
			where,
			transaction,
		}),
	]);

	return [rows, count];
};
