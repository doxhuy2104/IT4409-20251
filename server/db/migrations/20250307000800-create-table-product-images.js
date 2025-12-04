'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('ProductImages', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			variantId: {
				type: Sequelize.INTEGER,
				allowNull: true,
				references: { model: 'ProductVariants', key: 'id' },
				onDelete: 'SET NULL',
				onUpdate: 'CASCADE',
			},
			productId: {
				allowNull: true,
				type: Sequelize.INTEGER,
				references: { model: 'Products', key: 'id' },
				onDelete: 'SET NULL',
				onUpdate: 'CASCADE',
			},
			imageUrl: { allowNull: false, type: Sequelize.STRING(255) },
			isPrimary: { type: Sequelize.BOOLEAN, defaultValue: false },
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
			},
		});
	},
	async down(queryInterface) {
		await queryInterface.dropTable('ProductImages');
	},
};
