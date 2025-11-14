'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('CartItems', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			cartId: {
				allowNull: false,
				type: Sequelize.INTEGER,
				references: { model: 'Carts', key: 'id' },
				onDelete: 'CASCADE',
			},
			variantId: {
				allowNull: false,
				type: Sequelize.INTEGER,
				references: { model: 'ProductVariants', key: 'id' },
				onDelete: 'RESTRICT',
				onUpdate: 'CASCADE',
			},
			quantity: { allowNull: false, type: Sequelize.INTEGER },
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
		await queryInterface.dropTable('CartItems');
	},
};
