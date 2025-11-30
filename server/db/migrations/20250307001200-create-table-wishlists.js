'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Wishlists', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			customerId: {
				allowNull: false,
				type: Sequelize.INTEGER,
				references: { model: 'Customers', key: 'id' },
				onDelete: 'CASCADE',
				onUpdate: 'CASCADE',
			},
			productId: {
				allowNull: false,
				type: Sequelize.INTEGER,
				references: { model: 'Products', key: 'id' },
				onDelete: 'CASCADE',
				onUpdate: 'CASCADE',
			},
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
		await queryInterface.dropTable('Wishlists');
	},
};
