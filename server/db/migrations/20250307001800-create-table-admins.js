'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Admins', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			username: {
				allowNull: false,
				type: Sequelize.STRING(50),
				unique: true,
			},
			passwordHash: { allowNull: false, type: Sequelize.STRING(255) },
			fullName: { allowNull: false, type: Sequelize.STRING(100) },
			email: { type: Sequelize.STRING(100), unique: true },
			phone: { type: Sequelize.STRING(20), unique: true },
			role: {
				type: Sequelize.ENUM('super_admin', 'manager', 'staff'),
				defaultValue: 'staff',
			},
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
		await queryInterface.dropTable('Admins');
	},
};
