'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('BrandCategories', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			brandId: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: 'Brands',
					key: 'id',
				},
				onUpdate: 'CASCADE',
				onDelete: 'CASCADE',
			},
			categoryId: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: 'Categories',
					key: 'id',
				},
				onUpdate: 'CASCADE',
				onDelete: 'CASCADE',
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.fn('NOW'),
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.fn('NOW'),
			},
		});

		// Thêm unique constraint để tránh trùng lặp dữ liệu
		await queryInterface.addConstraint('BrandCategories', {
			fields: ['brandId', 'categoryId'],
			type: 'unique',
			name: 'unique_brand_category',
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('BrandCategories');
	},
};
