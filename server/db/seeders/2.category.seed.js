'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		const transaction = await queryInterface.sequelize.transaction();
		try {
			// Xóa toàn bộ dữ liệu cũ
			await queryInterface.bulkDelete('Categories', null, { transaction });

			// === Danh mục cấp 1 ===
			await queryInterface.bulkInsert(
				'Categories',
				[
					{
						name: 'Quà Tặng Trái cây',
						description: 'Giỏ quà tặng trái cây hữu cơ',
					},
					{
						name: 'Quà Tặng Tết',
						description: 'Giỏ quà Tết đặc biệt',
					},
					{
						name: 'Trái Cây Theo Mùa',
						description: 'Các loại trái cây theo mùa vụ',
					},
					{
						name: 'Bếp O - Ready To Eat',
						description: 'Thực phẩm chế biến sẵn từ Bếp O',
					},
					{
						name: 'Rau Củ Quả',
						description: 'Rau, củ, quả tươi và hữu cơ',
					},
					{
						name: 'Tươi Sống',
						description: 'Thực phẩm tươi sống các loại',
					},
					{
						name: 'Bếp O - Ready To Cook',
						description: 'Thực phẩm sơ chế sẵn từ Bếp O',
					},
					{
						name: 'Thực Phẩm Khô',
						description: 'Thực phẩm khô, đóng gói',
					},
					{
						name: 'Gia Vị & Phụ Liệu',
						description: 'Gia vị và nguyên liệu nấu ăn',
					},
					{
						name: 'Đồ Uống Tốt Sức Khỏe',
						description: 'Đồ uống giúp cải thiện sức khoẻ',
					},
					{
						name: 'Bơ - Sữa',
						description: 'Các sản phẩm từ sữa và bơ',
					},
					{
						name: 'Mẹ & Bé',
						description: 'Sản phẩm dinh dưỡng cho mẹ và bé',
					},
					{
						name: 'Superfood',
						description: 'Thực phẩm siêu dinh dưỡng',
					},
				],
				{ transaction },
			);

			// Lấy lại danh mục cha
			const categories = await queryInterface.sequelize.query(
				'SELECT id, name FROM "Categories";',
				{
					type: queryInterface.sequelize.QueryTypes.SELECT,
					transaction,
				},
			);

			// Quà Tặng Trái cây và Quà Tặng Tết là danh mục cấp 1, không có subcategory

			// === Trái Cây Theo Mùa ===
			const traiCayId = categories.find(
				(c) => c.name === 'Trái Cây Theo Mùa',
			)?.id;
			if (traiCayId) {
				await queryInterface.bulkInsert(
					'Categories',
					[
						{
							name: 'Trái Cây Việt',
							description: 'Trái cây nội địa',
							parentId: traiCayId,
						},
						{
							name: 'Trái Cây Nhập Khẩu',
							description: 'Trái cây nhập khẩu',
							parentId: traiCayId,
						},
						{
							name: 'Trái Cây Sấy - Đông Lạnh',
							description: 'Trái cây sấy và đông lạnh',
							parentId: traiCayId,
						},
						{
							name: 'Nước Ép Trái Cây Tươi',
							description: 'Nước ép từ trái cây tươi',
							parentId: traiCayId,
						},
					],
					{ transaction },
				);
			}

			// === Rau Củ Quả ===
			const rauCuId = categories.find((c) => c.name === 'Rau Củ Quả')?.id;
			if (rauCuId) {
				await queryInterface.bulkInsert(
					'Categories',
					[
						{
							name: 'Rau lá hữu cơ',
							description: 'Rau lá trồng hữu cơ',
							parentId: rauCuId,
						},
						{
							name: 'Củ Quả hữu cơ',
							description: 'Củ quả trồng hữu cơ',
							parentId: rauCuId,
						},
						{
							name: 'Nấm',
							description: 'Các loại nấm tươi',
							parentId: rauCuId,
						},
					],
					{ transaction },
				);
			}

			// === Tươi Sống ===
			const tuoiSongId = categories.find((c) => c.name === 'Tươi Sống')?.id;
			if (tuoiSongId) {
				await queryInterface.bulkInsert(
					'Categories',
					[
						{
							name: 'Thịt Heo Hữu Cơ',
							description: 'Thịt heo từ nguồn hữu cơ',
							parentId: tuoiSongId,
						},
						{
							name: 'Thịt Bò Hữu Cơ',
							description: 'Thịt bò hữu cơ',
							parentId: tuoiSongId,
						},
						{
							name: 'Thịt Bò Tơ Tây Ninh',
							description: 'Đặc sản bò tơ Tây Ninh',
							parentId: tuoiSongId,
						},
						{
							name: 'Thịt Bò Obe',
							description: 'Thịt bò Obe nhập khẩu',
							parentId: tuoiSongId,
						},
						{
							name: 'Thịt Gia Cầm - Trứng',
							description: 'Gà, vịt, trứng các loại',
							parentId: tuoiSongId,
						},
						{
							name: 'Thủy & Hải Sản',
							description: 'Các loại thủy sản và hải sản',
							parentId: tuoiSongId,
						},
						{
							name: 'Thuỷ Sản',
							description: 'Các loại thủy sản tươi sống',
							parentId: tuoiSongId,
						},
						{
							name: 'Hải Sản Khô & Một Nắng',
							description: 'Hải sản khô và một nắng',
							parentId: tuoiSongId,
						},
					],
					{ transaction },
				);
			}

			// === Thực Phẩm Khô ===
			const thucPhamKhoId = categories.find(
				(c) => c.name === 'Thực Phẩm Khô',
			)?.id;
			if (thucPhamKhoId) {
				await queryInterface.bulkInsert(
					'Categories',
					[
						{
							name: 'Các Loại Hạt Hữu Cơ',
							description: 'Hạt dinh dưỡng hữu cơ',
							parentId: thucPhamKhoId,
						},
						{
							name: 'Ngũ Cốc Hữu Cơ',
							description: 'Ngũ cốc tự nhiên',
							parentId: thucPhamKhoId,
						},
						{
							name: 'Gạo Hữu Cơ',
							description: 'Các loại gạo sạch',
							parentId: thucPhamKhoId,
						},
						{
							name: 'Mì & Nui Hữu Cơ',
							description: 'Mì và nui hữu cơ',
							parentId: thucPhamKhoId,
						},
						{
							name: 'Bánh Kẹo & Socola',
							description: 'Đồ ngọt và socola',
							parentId: thucPhamKhoId,
						},
						{
							name: 'Đồ Khô Khác',
							description: 'Thực phẩm khô khác',
							parentId: thucPhamKhoId,
						},
						{
							name: 'Nguyên Liệu Làm Bánh',
							description: 'Bột, đường, sữa làm bánh',
							parentId: thucPhamKhoId,
						},
						{
							name: 'Snack Organic',
							description: 'Đồ ăn vặt organic',
							parentId: thucPhamKhoId,
						},
					],
					{ transaction },
				);
			}

			// === Gia Vị & Phụ Liệu ===
			const giaViId = categories.find(
				(c) => c.name === 'Gia Vị & Phụ Liệu',
			)?.id;
			if (giaViId) {
				await queryInterface.bulkInsert(
					'Categories',
					[
						{
							name: 'Gia Vị Nguyên - Phụ Liệu',
							description: 'Gia vị và nguyên phụ liệu nấu ăn',
							parentId: giaViId,
						},
						{
							name: 'Mật Ong',
							description: 'Sản phẩm từ mật ong',
							parentId: giaViId,
						},
					],
					{ transaction },
				);
			}

			// === Đồ Uống Tốt Sức Khỏe ===
			const doUongId = categories.find(
				(c) => c.name === 'Đồ Uống Tốt Sức Khỏe',
			)?.id;
			if (doUongId) {
				await queryInterface.bulkInsert(
					'Categories',
					[
						{
							name: 'Trà Hữu Cơ',
							description: 'Trà từ thảo mộc hữu cơ',
							parentId: doUongId,
						},
						{
							name: 'Cà Phê Hữu Cơ',
							description: 'Cà phê hữu cơ nguyên chất',
							parentId: doUongId,
						},
						{
							name: 'Nước Ép Hữu Cơ',
							description: 'Nước ép trái cây hữu cơ',
							parentId: doUongId,
						},
						{
							name: 'Đồ Uống Có Cồn',
							description: 'Đồ uống có cồn cao cấp',
							parentId: doUongId,
						},
					],
					{ transaction },
				);
			}

			// === Bơ - Sữa ===
			const boSuaId = categories.find((c) => c.name === 'Bơ - Sữa')?.id;
			if (boSuaId) {
				await queryInterface.bulkInsert(
					'Categories',
					[
						{
							name: 'Sữa Hạt',
							description: 'Sữa làm từ hạt tự nhiên',
							parentId: boSuaId,
						},
						{
							name: 'Sữa Tươi',
							description: 'Sữa bò, sữa dê tươi',
							parentId: boSuaId,
						},
						{
							name: 'Sữa Chua',
							description: 'Sữa chua lên men tự nhiên',
							parentId: boSuaId,
						},
						{
							name: 'Bơ & Phomai',
							description: 'Bơ và phomai các loại',
							parentId: boSuaId,
						},
						{
							name: 'Sữa Đặc',
							description: 'Sữa đặc có đường',
							parentId: boSuaId,
						},
					],
					{ transaction },
				);
			}

			// === Mẹ & Bé ===
			const meBeId = categories.find((c) => c.name === 'Mẹ & Bé')?.id;
			if (meBeId) {
				// Mẹ & Bé là danh mục cấp 1, không có subcategory
			}

			// === Superfood ===
			const superfoodId = categories.find((c) => c.name === 'Superfood')?.id;
			if (superfoodId) {
				await queryInterface.bulkInsert(
					'Categories',
					[
						{
							name: 'Chăm Sóc Tiêu Hoá',
							description: 'Thực phẩm hỗ trợ tiêu hoá',
							parentId: superfoodId,
						},
						{
							name: 'Bổ Sung Sức Khoẻ',
							description: 'Thực phẩm tăng cường sức khoẻ',
							parentId: superfoodId,
						},
						{
							name: 'Protein Thực Vật Hữu Cơ',
							description: 'Protein nguồn gốc thực vật',
							parentId: superfoodId,
						},
					],
					{ transaction },
				);
			}

			await transaction.commit();
		} catch (error) {
			await transaction.rollback();
			console.error('Error while inserting categories:', error);
		}
	},

	async down(queryInterface, Sequelize) {
		const transaction = await queryInterface.sequelize.transaction();
		try {
			await queryInterface.bulkDelete('Categories', null, { transaction });
			await transaction.commit();
		} catch (error) {
			await transaction.rollback();
			console.error('Error while deleting categories:', error);
		}
	},
};
