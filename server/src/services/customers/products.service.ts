import { Op, Transaction } from 'sequelize';
import { db } from '../../loaders/database.loader';

export const getProducts = async (filters: any, transaction?: Transaction) => {
	const where: any = {
		isHidden: false,
	};
	const include: any[] = [
		{ model: db.productImages },
		{ model: db.productPromotions, include: [{ model: db.promotions }] },
	];

	// Điều kiện lọc theo id sản phẩm
	if (filters.id) {
		where.id = filters.id;
	}

	// Điều kiện lọc theo slug (hỗ trợ partial match, ưu tiên hơn name)
	if (filters.slug) {
		// Tìm kiếm theo slug với partial match (hỗ trợ tìm kiếm không dấu)
		where.slug = {
			[Op.iLike]: `%${filters.slug}%`
		};
	}
	// Điều kiện lọc theo tên sản phẩm (chỉ khi không có slug)
	else if (filters.name) {
		// iLike = case-insensitive LIKE, hỗ trợ Unicode tốt hơn
		where.name = {
			[Op.iLike]: `%${filters.name}%`
		};
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
	// Hỗ trợ cả priceRange object và min/max trực tiếp
	const priceMin = filters.priceRange?.min ?? filters.min;
	const priceMax = filters.priceRange?.max ?? filters.max;

	if (priceMin !== undefined || priceMax !== undefined) {
		where.price = {};
		if (priceMin !== undefined) {
			where.price[Op.gte] = priceMin;
		}
		if (priceMax !== undefined && priceMax !== Number.MAX_SAFE_INTEGER) {
			where.price[Op.lte] = priceMax;
		}
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
