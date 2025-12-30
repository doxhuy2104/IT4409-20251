'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const revenues = [];
        // Start from today (2025-12-28) and go back 14 days
        const endDate = new Date('2025-12-28');

        for (let i = 0; i < 14; i++) {
            const date = new Date(endDate);
            date.setDate(endDate.getDate() - i);

            // Random revenue between 5,000,000 and 20,000,000
            const totalRevenue = Math.floor(Math.random() * (20000000 - 5000000 + 1) + 5000000);

            // Random orders between 5 and 30
            const totalOrders = Math.floor(Math.random() * (30 - 5 + 1) + 5);

            // Create DATEONLY string (YYYY-MM-DD)
            const dateString = date.toISOString().split('T')[0];

            revenues.push({
                date: dateString,
                totalRevenue: totalRevenue,
                totalOrders: totalOrders,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        await queryInterface.bulkInsert('Revenues', revenues, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Revenues', null, {});
    }
};
