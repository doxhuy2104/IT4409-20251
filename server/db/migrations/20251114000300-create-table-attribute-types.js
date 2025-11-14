'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('AttributeTypes', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			categoryId: {
				type: Sequelize.INTEGER,
				references: { model: 'Categories', key: 'id' },
				onDelete: 'SET NULL',
				onUpdate: 'CASCADE',
			},
			parentId: {
				type: Sequelize.INTEGER,
				allowNull: true,
				references: { model: 'AttributeTypes', key: 'id' },
				onDelete: 'SET NULL',
				onUpdate: 'CASCADE',
			},
			name: {
				allowNull: false,
				type: Sequelize.STRING(100),
			},
			description: { type: Sequelize.TEXT },
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
		await queryInterface.dropTable('AttributeTypes');
	},
};
