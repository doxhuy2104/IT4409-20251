'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Promotions', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			name: { allowNull: false, type: Sequelize.STRING(100) },
			discountPercent: { type: Sequelize.DECIMAL(5, 2) },
			discountAmount: { type: Sequelize.DECIMAL(15, 2) },
			minimumPurchaseAmount: { type: Sequelize.DECIMAL(15, 2) },
			maximumDiscountAmount: { type: Sequelize.DECIMAL(15, 2) },
			discountCode: { type: Sequelize.STRING(50), unique: true },
			usageLimit: { type: Sequelize.INTEGER },
			usageCount: { type: Sequelize.INTEGER, defaultValue: 0 },
			usageLimitPerCustomer: { type: Sequelize.INTEGER },
			isActive: { type: Sequelize.BOOLEAN, defaultValue: true },
			isDeleted: { type: Sequelize.BOOLEAN, defaultValue: false },
			isExpired: { type: Sequelize.BOOLEAN, defaultValue: false },
			startDate: { allowNull: true, type: Sequelize.DATE },
			endDate: { allowNull: true, type: Sequelize.DATE },
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
		await queryInterface.dropTable('Promotions');
	},
};
