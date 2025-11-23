'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const transaction = await queryInterface.sequelize.transaction();
		try {
			// Xóa toàn bộ dữ liệu cũ trong bảng Brands
			await queryInterface.bulkDelete('Brands', null, { transaction });

			// Thêm danh sách thương hiệu mới
			await queryInterface.bulkInsert(
				'Brands',
				[
					{
						name: 'Organicfood.vn',
						logoUrl: 'brands/organicfoodvn.png',
						description:
							'Organicfood.vn là thương hiệu chuyên cung cấp thực phẩm hữu cơ, rau củ quả sạch và sản phẩm dinh dưỡng tự nhiên cho sức khỏe.',
					},
					{
						name: 'Khác',
						logoUrl: 'brands/khac.png',
						description:
							'Thương hiệu tổng hợp dành cho các sản phẩm không thuộc các thương hiệu chính hoặc hàng nhập khẩu đặc biệt.',
					},
					{
						name: 'Mục Đồng',
						logoUrl: 'brands/mucdong.png',
						description:
							'Mục Đồng là thương hiệu Việt Nam chuyên cung cấp các sản phẩm nông nghiệp sạch, hữu cơ và thân thiện với môi trường.',
					},
					{
						name: 'Bếp O',
						logoUrl: 'brands/bepo.png',
						description:
							'Bếp O là thương hiệu thực phẩm sạch chuyên cung cấp các món ăn chế biến sẵn, thực phẩm tươi ngon và an toàn cho sức khỏe.',
					},
					{
						name: 'ECO SWEETS',
						logoUrl: 'brands/ecosweets.png',
						description:
							'ECO SWEETS mang đến các sản phẩm bánh kẹo, đồ ngọt hữu cơ và tự nhiên, không chất bảo quản, tốt cho sức khỏe.',
					},
					{
						name: 'Fuwa3e',
						logoUrl: 'brands/fuwa3e.png',
						description:
							'Fuwa3e là thương hiệu nổi tiếng với các sản phẩm tẩy rửa sinh học, thân thiện với môi trường, an toàn cho người sử dụng.',
					},
					{
						name: 'TheorganiKcoffee',
						logoUrl: 'brands/theorganikcoffee.png',
						description:
							'TheorganiKcoffee cung cấp cà phê hữu cơ, được trồng và rang xay theo quy trình tự nhiên, mang đến hương vị tinh khiết và nguyên bản.',
					},
					{
						name: 'Altavie',
						logoUrl: 'brands/altavie.png',
						description:
							'Altavie là thương hiệu quốc tế chuyên về các sản phẩm chăm sóc sức khỏe, vitamin và thực phẩm bổ sung hữu cơ.',
					},
					{
						name: 'Kirkland',
						logoUrl: 'brands/kirkland.png',
						description:
							'Kirkland là thương hiệu nổi tiếng của Mỹ, cung cấp thực phẩm, đồ uống và các sản phẩm tiêu dùng chất lượng cao.',
					},
				],
				{ transaction },
			);

			await transaction.commit();
		} catch (error) {
			await transaction.rollback();
			console.error('Error inserting Brands:', error);
			return;
		}
	},

	down: async (queryInterface, Sequelize) => {
		const transaction = await queryInterface.sequelize.transaction();
		try {
			await queryInterface.bulkDelete('Brands', null, { transaction });
			await transaction.commit();
		} catch (error) {
			await transaction.rollback();
			console.error('Error while deleting Brands:', error);
		}
	},
};
