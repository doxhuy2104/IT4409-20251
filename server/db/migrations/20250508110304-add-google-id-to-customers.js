'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('Customers', 'googleId', {
			type: Sequelize.STRING(100),
			allowNull: true,
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('Customers', 'googleId');
	},
};
