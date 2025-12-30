'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Revenues', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            date: {
                type: Sequelize.DATEONLY,
                allowNull: false,
                unique: true
            },
            totalRevenue: {
                type: Sequelize.DECIMAL(15, 2),
                allowNull: false,
                defaultValue: 0
            },
            totalOrders: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('NOW')
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('NOW')
            }
        });

        // Add index on date for faster lookups
        await queryInterface.addIndex('Revenues', ['date']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Revenues');
    }
};
