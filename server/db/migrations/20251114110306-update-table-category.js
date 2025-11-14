'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('Categories', 'brandId', {
			type: Sequelize.INTEGER,
			allowNull: true,
			references: { model: 'Brands', key: 'id' },
			onDelete: 'SET NULL',
			onUpdate: 'CASCADE',
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('Categories', 'brandId');
	},
};
