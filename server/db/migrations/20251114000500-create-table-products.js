'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Products', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			name: { allowNull: false, type: Sequelize.STRING(255) },
			slug: {
				allowNull: false,
				type: Sequelize.STRING(255),
				unique: true,
			},
			categoryId: {
				allowNull: false,
				type: Sequelize.INTEGER,
				references: { model: 'Categories', key: 'id' },
				onDelete: 'RESTRICT',
				onUpdate: 'CASCADE',
			},
			brandId: {
				allowNull: false,
				type: Sequelize.INTEGER,
				references: { model: 'Brands', key: 'id' },
				onDelete: 'RESTRICT',
				onUpdate: 'CASCADE',
			},
			description: { type: Sequelize.TEXT },
			basePrice: { allowNull: false, type: Sequelize.DECIMAL(15, 2) },
			isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.fn('CURRENT_TIMESTAMP'),
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.fn('CURRENT_TIMESTAMP'),
			},
		});
	},
	async down(queryInterface) {
		await queryInterface.dropTable('Products');
	},
};
