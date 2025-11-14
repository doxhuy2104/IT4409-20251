'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Shipping', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			orderId: {
				allowNull: false,
				type: Sequelize.INTEGER,
				references: { model: 'Orders', key: 'id' },
				onDelete: 'CASCADE',
				onUpdate: 'CASCADE',
			},
			shippingProvider: { allowNull: false, type: Sequelize.STRING(100) },
			trackingNumber: { type: Sequelize.STRING(100) },
			shippedAt: { type: Sequelize.DATE },
			deliveredAt: { type: Sequelize.DATE },
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
		await queryInterface.dropTable('Shipping');
	},
};
