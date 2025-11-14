'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Payments', {
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
			amount: { allowNull: false, type: Sequelize.DECIMAL(15, 2) },
			paymentMethod: { allowNull: false, type: Sequelize.STRING(50) },
			transactionId: { type: Sequelize.STRING(100) },
			status: {
				type: Sequelize.ENUM('pending', 'success', 'failed'),
				defaultValue: 'pending',
			},
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
		await queryInterface.dropTable('Payments');
	},
};
