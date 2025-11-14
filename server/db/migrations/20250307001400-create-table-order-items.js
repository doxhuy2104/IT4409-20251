'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('OrderItems', {
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
			variantId: {
				allowNull: false,
				type: Sequelize.INTEGER,
				references: { model: 'ProductVariants', key: 'id' },
				onDelete: 'RESTRICT',
				onUpdate: 'CASCADE',
			},
			quantity: { allowNull: false, type: Sequelize.INTEGER },
			priceAtTime: { allowNull: false, type: Sequelize.DECIMAL(15, 2) },
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
		await queryInterface.dropTable('OrderItems');
	},
};
