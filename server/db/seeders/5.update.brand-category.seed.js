'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const transaction = await queryInterface.sequelize.transaction();
		try {
			// Xóa toàn bộ dữ liệu cũ trong bảng BrandCategories
			await queryInterface.bulkDelete('BrandCategories', null, {
				transaction,
			});

			const data = [
				{
					name: 'Organicfood.vn',
					categories: [
						'Quà Tặng Trái cây',
						'Quà Tặng Tết',
						'Trái Cây Theo Mùa',
						'Bếp O - Ready To Eat',
						'Rau Củ Quả',
						'Tươi Sống',
						'Bếp O - Ready To Cook',
						'Thực Phẩm Khô',
						'Gia Vị & Phụ Liệu',
						'Đồ Uống Tốt Sức Khỏe',
						'Bơ - Sữa',
						'Mẹ & Bé',
						'Superfood',
					],
				},
				{
					name: 'Khác',
					categories: [
						'Quà Tặng Trái cây',
						'Quà Tặng Tết',
						'Trái Cây Theo Mùa',
						'Bếp O - Ready To Eat',
						'Rau Củ Quả',
						'Tươi Sống',
						'Bếp O - Ready To Cook',
						'Thực Phẩm Khô',
						'Gia Vị & Phụ Liệu',
						'Đồ Uống Tốt Sức Khỏe',
						'Bơ - Sữa',
						'Mẹ & Bé',
						'Superfood',
					],
				},
				{
					name: 'Mục Đồng',
					categories: [
						'Trái Cây Theo Mùa',
						'Rau Củ Quả',
						'Tươi Sống',
						'Thực Phẩm Khô',
						'Gia Vị & Phụ Liệu',
					],
				},
				{
					name: 'Bếp O',
					categories: [
						'Bếp O - Ready To Eat',
						'Bếp O - Ready To Cook',
					],
				},
				{
					name: 'ECO SWEETS',
					categories: [
						'Thực Phẩm Khô',
						'Quà Tặng Tết',
					],
				},
				{
					name: 'Fuwa3e',
					categories: [
						'Gia Vị & Phụ Liệu',
					],
				},
				{
					name: 'TheorganiKcoffee',
					categories: [
						'Đồ Uống Tốt Sức Khỏe',
					],
				},
				{
					name: 'Altavie',
					categories: [
						'Superfood',
						'Mẹ & Bé',
					],
				},
				{
					name: 'Kirkland',
					categories: [
						'Thực Phẩm Khô',
						'Đồ Uống Tốt Sức Khỏe',
						'Bơ - Sữa',
						'Superfood',
					],
				},
			];

			// Lấy tất cả brands và categories hiện có
			const existingBrands = await queryInterface.sequelize.query(
				'SELECT id, name FROM "Brands"',
				{
					type: queryInterface.sequelize.QueryTypes.SELECT,
					transaction,
				},
			);

			const existingCategories = await queryInterface.sequelize.query(
				'SELECT id, name FROM "Categories"',
				{
					type: queryInterface.sequelize.QueryTypes.SELECT,
					transaction,
				},
			);

			// Tạo mapping để dễ tìm kiếm
			const brandMap = new Map();
			existingBrands.forEach((brand) => {
				brandMap.set(brand.name, brand.id);
			});

			const categoryMap = new Map();
			existingCategories.forEach((category) => {
				categoryMap.set(category.name, category.id);
			});

			// Mảng để lưu các bản ghi BrandCategories cần thêm
			const brandCategoryRecords = [];

			// Xử lý từng brand và category
			for (const brand of data) {
				let brandId;

				// Kiểm tra nếu brand đã tồn tại
				if (brandMap.has(brand.name)) {
					brandId = brandMap.get(brand.name);
				} else {
					// Nếu brand chưa tồn tại, tạo mới
					await queryInterface.sequelize.query(
						`INSERT INTO "Brands" (name, "createdAt", "updatedAt")
						VALUES ('${brand.name}', NOW(), NOW())`,
						{
							type: queryInterface.sequelize.QueryTypes.INSERT,
							transaction,
						},
					);

					// Truy vấn lại để lấy ID
					const newBrand = await queryInterface.sequelize.query(
						`SELECT id FROM "Brands" WHERE name = '${brand.name}' LIMIT 1`,
						{
							type: queryInterface.sequelize.QueryTypes.SELECT,
							transaction,
						},
					);

					brandId = newBrand[0].id;
					brandMap.set(brand.name, brandId);
				}

				// Xử lý từng category của brand
				for (const categoryName of brand.categories) {
					let categoryId;

					// Kiểm tra nếu category đã tồn tại
					if (categoryMap.has(categoryName)) {
						categoryId = categoryMap.get(categoryName);
					} else {
						// Nếu category chưa tồn tại, bỏ qua (category đã được tạo trong seeder khác)
						console.warn(
							`Category "${categoryName}" not found, skipping...`,
						);
						continue;
					}

					// Kiểm tra xem bản ghi đã tồn tại chưa
					const existingRecord = await queryInterface.sequelize.query(
						`SELECT id FROM "BrandCategories" WHERE "brandId" = ${brandId} AND "categoryId" = ${categoryId} LIMIT 1`,
						{
							type: queryInterface.sequelize.QueryTypes.SELECT,
							transaction,
						},
					);

					if (existingRecord.length === 0) {
						// Thêm bản ghi liên kết vào mảng
						brandCategoryRecords.push({
							brandId,
							categoryId,
							createdAt: new Date(),
							updatedAt: new Date(),
						});
					}
				}
			}

			// Thêm tất cả bản ghi vào bảng BrandCategories
			if (brandCategoryRecords.length > 0) {
				await queryInterface.bulkInsert(
					'BrandCategories',
					brandCategoryRecords,
					{ transaction },
				);
			}

			await transaction.commit();
			console.log('Brand-Category relationships created successfully');
		} catch (error) {
			await transaction.rollback();
			console.error(
				'Error creating Brand-Category relationships:',
				error,
			);
			throw error;
		}
	},

	down: async (queryInterface, Sequelize) => {
		const transaction = await queryInterface.sequelize.transaction();
		try {
			// Xóa tất cả các bản ghi trong bảng BrandCategories
			await queryInterface.bulkDelete('BrandCategories', null, {
				transaction,
			});
			await transaction.commit();
			console.log(
				'All Brand-Category relationships removed successfully',
			);
		} catch (error) {
			await transaction.rollback();
			console.error(
				'Error removing Brand-Category relationships:',
				error,
			);
			throw error;
		}
	},
};
