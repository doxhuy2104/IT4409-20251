const bcrypt = require('bcryptjs');

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const existingAdmin = await queryInterface.rawSelect(
			'Admins',
			{
				where: {
					email: process.env.ADMIN_EMAIL,
					phone: process.env.ADMIN_PHONE,
				},
			},
			['id'],
		);

		if (existingAdmin) {
			console.log('Admin already exists. Skipping seeding.');
			return;
		}

		const passwordHash = await bcrypt.hash(
			process.env.ADMIN_PASSWORD,
			Number(process.env.SALT_ROUNDS),
		);
		return await queryInterface.bulkInsert('Admins', [
			{
				username: process.env.ADMIN_USERNAME,
				fullName: process.env.ADMIN_USERNAME,
				passwordHash,
				email: process.env.ADMIN_EMAIL,
				phone: process.env.ADMIN_PHONE,
				role: 'super_admin',
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		]);
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete('Admins', null, {});
	},
};
