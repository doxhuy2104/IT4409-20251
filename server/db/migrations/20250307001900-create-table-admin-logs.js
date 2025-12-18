'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('AdminLogs', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			adminId: {
				allowNull: false,
				type: Sequelize.INTEGER,
				references: { model: 'Admins', key: 'id' },
				onDelete: 'RESTRICT',
				onUpdate: 'CASCADE',
			},
			action: { allowNull: false, type: Sequelize.STRING(100) },
			entityType: { type: Sequelize.STRING(50) },
			entityId: { type: Sequelize.INTEGER },
			details: { type: Sequelize.JSON },
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
		await queryInterface.dropTable('AdminLogs');
	},
};
