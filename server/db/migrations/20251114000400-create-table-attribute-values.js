'use strict';
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('AttributeValues', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			attributeTypeId: {
				allowNull: false,
				type: Sequelize.INTEGER,
				references: { model: 'AttributeTypes', key: 'id' },
				onDelete: 'RESTRICT',
				onUpdate: 'CASCADE',
			},
			value: { allowNull: false, type: Sequelize.STRING(100) },
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
		await queryInterface.dropTable('AttributeValues');
	},
};
