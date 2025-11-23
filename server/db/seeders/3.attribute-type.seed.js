'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		const transaction = await queryInterface.sequelize.transaction();
		try {
			//delete all categories
			await queryInterface.bulkDelete('AttributeTypes', null, {
				transaction,
			});

			const categories = await queryInterface.sequelize.query(
				'SELECT id, name FROM "Categories";',
				{
					type: queryInterface.sequelize.QueryTypes.SELECT,
					transaction,
				},
			);

			// Lấy ID các danh mục
			const quaTangTraiCayId = categories.find(
				(category) => category.name === 'Quà Tặng Trái cây',
			)?.id;
			const quaTangTetId = categories.find(
				(category) => category.name === 'Quà Tặng Tết',
			)?.id;
			const traiCayTheoMuaId = categories.find(
				(category) => category.name === 'Trái Cây Theo Mùa',
			)?.id;
			const bepOReadyToEatId = categories.find(
				(category) => category.name === 'Bếp O - Ready To Eat',
			)?.id;
			const rauCuQuaId = categories.find(
				(category) => category.name === 'Rau Củ Quả',
			)?.id;
			const tuoiSongId = categories.find(
				(category) => category.name === 'Tươi Sống',
			)?.id;
			const bepOReadyToCookId = categories.find(
				(category) => category.name === 'Bếp O - Ready To Cook',
			)?.id;
			const thucPhamKhoId = categories.find(
				(category) => category.name === 'Thực Phẩm Khô',
			)?.id;
			const giaViPhuLieuId = categories.find(
				(category) => category.name === 'Gia Vị & Phụ Liệu',
			)?.id;
			const doUongTotSucKhoeId = categories.find(
				(category) => category.name === 'Đồ Uống Tốt Sức Khỏe',
			)?.id;
			const boSuaId = categories.find(
				(category) => category.name === 'Bơ - Sữa',
			)?.id;
			const meBeId = categories.find(
				(category) => category.name === 'Mẹ & Bé',
			)?.id;
			const superfoodId = categories.find(
				(category) => category.name === 'Superfood',
			)?.id;

			// Định nghĩa các thuộc tính cho từng danh mục
			const quaTangTraiCayTypes = [
				{
					name: 'Thông tin sản phẩm',
					children: [
						'Trọng lượng',
						'Kích thước',
						'Loại quà tặng',
						'Thành phần',
						'Hạn sử dụng',
						'Xuất xứ',
					],
				},
			];

			const quaTangTetTypes = [
				{
					name: 'Thông tin sản phẩm',
					children: [
						'Trọng lượng',
						'Kích thước',
						'Loại quà tặng',
						'Thành phần',
						'Hạn sử dụng',
						'Xuất xứ',
					],
				},
			];

			const traiCayTheoMuaTypes = [
				{
					name: 'Thông tin cơ bản',
					children: [
						'Loại trái cây',
						'Xuất xứ',
						'Trọng lượng',
						'Độ chín',
						'Hạn sử dụng',
						'Bảo quản',
					],
				},
				{
					name: 'Chất lượng',
					children: [
						'Chứng nhận hữu cơ',
						'Không chất bảo quản',
						'An toàn thực phẩm',
					],
				},
			];

			const bepOReadyToEatTypes = [
				{
					name: 'Thông tin sản phẩm',
					children: [
						'Trọng lượng',
						'Thành phần',
						'Hạn sử dụng',
						'Bảo quản',
						'Cách sử dụng',
					],
				},
				{
					name: 'Dinh dưỡng',
					children: [
						'Calories',
						'Protein',
						'Carbohydrate',
						'Fat',
						'Chất xơ',
					],
				},
			];

			const rauCuQuaTypes = [
				{
					name: 'Thông tin cơ bản',
					children: [
						'Loại rau củ quả',
						'Xuất xứ',
						'Trọng lượng',
						'Hạn sử dụng',
						'Bảo quản',
					],
				},
				{
					name: 'Chất lượng',
					children: [
						'Chứng nhận hữu cơ',
						'Không thuốc trừ sâu',
						'An toàn thực phẩm',
					],
				},
			];

			const tuoiSongTypes = [
				{
					name: 'Thông tin cơ bản',
					children: [
						'Loại thực phẩm',
						'Xuất xứ',
						'Trọng lượng',
						'Hạn sử dụng',
						'Bảo quản',
					],
				},
				{
					name: 'Chất lượng',
					children: [
						'Chứng nhận hữu cơ',
						'Không kháng sinh',
						'An toàn thực phẩm',
					],
				},
			];

			const bepOReadyToCookTypes = [
				{
					name: 'Thông tin sản phẩm',
					children: [
						'Trọng lượng',
						'Thành phần',
						'Hạn sử dụng',
						'Bảo quản',
						'Cách chế biến',
					],
				},
				{
					name: 'Dinh dưỡng',
					children: [
						'Calories',
						'Protein',
						'Carbohydrate',
						'Fat',
						'Chất xơ',
					],
				},
			];

			const thucPhamKhoTypes = [
				{
					name: 'Thông tin cơ bản',
					children: [
						'Loại thực phẩm',
						'Xuất xứ',
						'Trọng lượng',
						'Hạn sử dụng',
						'Bảo quản',
					],
				},
				{
					name: 'Chất lượng',
					children: [
						'Chứng nhận hữu cơ',
						'Không chất bảo quản',
						'An toàn thực phẩm',
					],
				},
				{
					name: 'Dinh dưỡng',
					children: [
						'Calories',
						'Protein',
						'Carbohydrate',
						'Fat',
						'Chất xơ',
					],
				},
			];

			const giaViPhuLieuTypes = [
				{
					name: 'Thông tin cơ bản',
					children: [
						'Loại gia vị',
						'Xuất xứ',
						'Trọng lượng',
						'Hạn sử dụng',
						'Bảo quản',
					],
				},
				{
					name: 'Chất lượng',
					children: [
						'Chứng nhận hữu cơ',
						'Không chất bảo quản',
						'An toàn thực phẩm',
					],
				},
			];

			const doUongTotSucKhoeTypes = [
				{
					name: 'Thông tin cơ bản',
					children: [
						'Loại đồ uống',
						'Xuất xứ',
						'Dung tích',
						'Hạn sử dụng',
						'Bảo quản',
					],
				},
				{
					name: 'Chất lượng',
					children: [
						'Chứng nhận hữu cơ',
						'Không chất bảo quản',
						'Không đường hóa học',
					],
				},
				{
					name: 'Dinh dưỡng',
					children: [
						'Calories',
						'Đường',
						'Chất xơ',
						'Vitamin',
					],
				},
			];

			const boSuaTypes = [
				{
					name: 'Thông tin cơ bản',
					children: [
						'Loại sản phẩm',
						'Xuất xứ',
						'Dung tích/Trọng lượng',
						'Hạn sử dụng',
						'Bảo quản',
					],
				},
				{
					name: 'Chất lượng',
					children: [
						'Chứng nhận hữu cơ',
						'Không chất bảo quản',
						'An toàn thực phẩm',
					],
				},
				{
					name: 'Dinh dưỡng',
					children: [
						'Calories',
						'Protein',
						'Carbohydrate',
						'Fat',
						'Canxi',
					],
				},
			];

			const meBeTypes = [
				{
					name: 'Thông tin cơ bản',
					children: [
						'Loại sản phẩm',
						'Xuất xứ',
						'Trọng lượng',
						'Hạn sử dụng',
						'Bảo quản',
					],
				},
				{
					name: 'Chất lượng',
					children: [
						'Chứng nhận hữu cơ',
						'Không chất bảo quản',
						'An toàn cho trẻ em',
					],
				},
				{
					name: 'Dinh dưỡng',
					children: [
						'Calories',
						'Protein',
						'Carbohydrate',
						'Fat',
						'Vitamin',
						'Khoáng chất',
					],
				},
			];

			const superfoodTypes = [
				{
					name: 'Thông tin cơ bản',
					children: [
						'Loại superfood',
						'Xuất xứ',
						'Trọng lượng',
						'Hạn sử dụng',
						'Bảo quản',
					],
				},
				{
					name: 'Chất lượng',
					children: [
						'Chứng nhận hữu cơ',
						'Không chất bảo quản',
						'An toàn thực phẩm',
					],
				},
				{
					name: 'Dinh dưỡng',
					children: [
						'Calories',
						'Protein',
						'Carbohydrate',
						'Fat',
						'Chất xơ',
						'Chất chống oxy hóa',
					],
				},
				{
					name: 'Công dụng',
					children: [
						'Hỗ trợ tiêu hóa',
						'Tăng cường miễn dịch',
						'Bổ sung dinh dưỡng',
					],
				},
			];

			const createAttributeValues = async (categoryId, types) => {
				if (!categoryId) return;
				if (
					Array.isArray(types) &&
					types.every((item) => typeof item === 'string')
				) {
					for (let type of types) {
						await queryInterface.bulkInsert(
							'AttributeTypes',
							[
								{
									name: type,
									categoryId,
									createdAt: new Date(),
									updatedAt: new Date(),
								},
							],
							{ transaction },
						);
					}
				} else {
					for (let type of types) {
						const { name, children } = type;
						await queryInterface.bulkInsert(
							'AttributeTypes',
							[
								{
									name,
									categoryId,
									createdAt: new Date(),
									updatedAt: new Date(),
								},
							],
							{ transaction },
						);

						// Lấy ID của parent vừa tạo
						const parentRecord = await queryInterface.sequelize.query(
							`SELECT id FROM "AttributeTypes" WHERE name = '${name}' AND "categoryId" = ${categoryId} AND "parentId" IS NULL ORDER BY id DESC LIMIT 1`,
							{
								type: queryInterface.sequelize.QueryTypes.SELECT,
								transaction,
							},
						);

						const parentId = parentRecord[0]?.id;

						if (parentId) {
							for (let child of children) {
								await queryInterface.bulkInsert(
									'AttributeTypes',
									[
										{
											name: child,
											parentId: parentId,
											categoryId,
											createdAt: new Date(),
											updatedAt: new Date(),
										},
									],
									{ transaction },
								);
							}
						}
					}
				}
			};

			await Promise.all([
				createAttributeValues(quaTangTraiCayId, quaTangTraiCayTypes),
				createAttributeValues(quaTangTetId, quaTangTetTypes),
				createAttributeValues(traiCayTheoMuaId, traiCayTheoMuaTypes),
				createAttributeValues(bepOReadyToEatId, bepOReadyToEatTypes),
				createAttributeValues(rauCuQuaId, rauCuQuaTypes),
				createAttributeValues(tuoiSongId, tuoiSongTypes),
				createAttributeValues(bepOReadyToCookId, bepOReadyToCookTypes),
				createAttributeValues(thucPhamKhoId, thucPhamKhoTypes),
				createAttributeValues(giaViPhuLieuId, giaViPhuLieuTypes),
				createAttributeValues(doUongTotSucKhoeId, doUongTotSucKhoeTypes),
				createAttributeValues(boSuaId, boSuaTypes),
				createAttributeValues(meBeId, meBeTypes),
				createAttributeValues(superfoodId, superfoodTypes),
			]);

			await transaction.commit();
		} catch (error) {
			await transaction.rollback();
			console.error('Error while inserting categories:', error);
		}
	},

	async down(queryInterface, Sequelize) {
		const transaction = await queryInterface.sequelize.transaction();
		try {
			await queryInterface.bulkDelete('AttributeTypes', null, {
				transaction,
			});
			await transaction.commit();
		} catch (error) {
			await transaction.rollback();
			console.error('Error while deleting categories:', error);
		}
	},
};
