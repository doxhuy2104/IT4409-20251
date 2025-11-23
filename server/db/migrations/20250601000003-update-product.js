'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('Products', 'isHidden', {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
			after: 'id',
		});
	},
	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn('Products', 'isHidden');
	},
};
