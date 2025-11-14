'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('Brands', 'categoryId', {
			type: Sequelize.INTEGER,
			allowNull: true,
			references: { model: 'Categories', key: 'id' },
			onDelete: 'SET NULL',
			onUpdate: 'CASCADE',
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('Brands', 'categoryId');
	},
};
