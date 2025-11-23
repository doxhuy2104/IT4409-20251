'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Customers', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			fullName: { allowNull: false, type: Sequelize.STRING(100) },
			email: { type: Sequelize.STRING(100), unique: true },
			phone: { type: Sequelize.STRING(20), unique: true },
			passwordHash: { type: Sequelize.STRING(255) },
			address: { type: Sequelize.TEXT },
			isActive: { type: Sequelize.BOOLEAN, defaultValue: false },
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
		await queryInterface.dropTable('Customers');
	},
};
