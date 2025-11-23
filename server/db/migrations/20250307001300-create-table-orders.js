'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Orders', {
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
				onDelete: 'RESTRICT',
				onUpdate: 'CASCADE',
			},
			warehouseId: {
				type: Sequelize.INTEGER,
				allowNull: true,
				references: { model: 'Warehouses', key: 'id' },
				onDelete: 'SET NULL',
				onUpdate: 'CASCADE',
			},
			totalAmount: { allowNull: false, type: Sequelize.DECIMAL(15, 2) },
			status: {
				type: Sequelize.ENUM(
					'pending',
					'processing',
					'shipped',
					'delivered',
					'cancelled',
				),
				defaultValue: 'pending',
			},
			shippingAddress: { allowNull: false, type: Sequelize.TEXT },
			paymentMethod: { type: Sequelize.STRING(50) },
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
		await queryInterface.dropTable('Orders');
	},
};
