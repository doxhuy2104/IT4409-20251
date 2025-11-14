'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.changeColumn('Orders', 'status', {
			type: Sequelize.ENUM(
				'draft',
				'pending',
				'processing',
				'shipped',
				'delivered',
				'cancelled',
			),
			allowNull: false,
			defaultValue: 'draft',
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.changeColumn('Orders', 'status', {
			type: Sequelize.ENUM(
				'pending',
				'processing',
				'shipped',
				'delivered',
				'cancelled',
			),
			allowNull: false,
			defaultValue: 'pending',
		});
	},
};
