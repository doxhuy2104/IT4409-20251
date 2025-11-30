'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Reviews', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			productId: {
				allowNull: false,
				type: Sequelize.INTEGER,
				references: { model: 'Products', key: 'id' },
				onDelete: 'CASCADE',
				onUpdate: 'CASCADE',
			},
			customerId: {
				allowNull: false,
				type: Sequelize.INTEGER,
				references: { model: 'Customers', key: 'id' },
				onDelete: 'RESTRICT',
				onUpdate: 'CASCADE',
			},
			rating: { type: Sequelize.INTEGER },
			comment: { type: Sequelize.TEXT },
			isApproved: { type: Sequelize.BOOLEAN, defaultValue: true },
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
		await queryInterface.dropTable('Reviews');
	},
};
