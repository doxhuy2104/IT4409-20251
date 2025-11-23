import { Op, Transaction } from 'sequelize';
import { db } from '../../loaders/database.loader';

export const getProducts = async (filters: any, transaction?: Transaction) => {
	const where: any = {
		isHidden: false,
	};
	const include: any[] = [
		{ model: db.productVariants, include: [{ model: db.productImages }] },
		{ model: db.productImages },
		{ model: db.productPromotions, include: [{ model: db.promotions }] },
	];

	// Điều kiện lọc theo id sản phẩm
	if (filters.id) {
		where.id = filters.id;
	}

	// Điều kiện lọc theo tên sản phẩm
	if (filters.name) {
		where.name = { [Op.like]: `%${filters.name}%` };
	}
	if (filters.slug) {
		where.slug = filters.slug;
	}

	// Điều kiện lọc theo brandId
	if (filters.brandId) {
		where.brandId = filters.brandId;
	}

	// Điều kiện lọc theo categoryId
	if (filters.categoryId) {
		where.categoryId = filters.categoryId;
	}

	// Điều kiện lọc theo khoảng giá
	if (filters.priceRange.min || filters.priceRange.max) {
		where.basePrice = {};
		if (filters.priceRange.min)
			where.basePrice[Op.gte] = filters.priceRange.min;
		if (filters.priceRange.max)
			where.basePrice[Op.lte] = filters.priceRange.max;
	}

	// Thêm mối quan hệ với bảng brands nếu cần
	if (filters.include?.includes('brand')) {
		include.push({ model: db.brands });
	}

	// Thêm mối quan hệ với bảng categories nếu cần
	if (filters.include?.includes('category')) {
		include.push({ model: db.categories });
	}

	// Lấy dữ liệu từ cơ sở dữ liệu với phân trang
	const [rows, count] = await Promise.all([
		db.products.findAll({
			where,
			include,
			order: filters.order,
			limit: filters.limit,
			offset: filters.offset,
			transaction,
		}),
		db.products.count({
			where,
			transaction,
		}),
	]);

	return [rows, count];
};
