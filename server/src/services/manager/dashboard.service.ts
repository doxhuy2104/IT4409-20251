import { db } from '../../loaders/database.loader';
import { Transaction, Op } from 'sequelize';

export const getAllDashboard = async (transaction?: Transaction) => {
	// Lấy tất cả admins
	const admins = await db.admins.count({ transaction });
	// Lấy tất cả customers
	const customers = await db.customers.count({ transaction });
	// Lấy tất cả products
	const products = await db.products.count({ transaction });
	// Lấy tất cả orders
	const now = new Date();
	const oneMonthAgo = new Date();
	oneMonthAgo.setMonth(now.getMonth() - 1); // Lùi lại 1 tháng

	const orders = await db.orders.count({
		where: {
			createdAt: {
				[Op.between]: [oneMonthAgo, now],
			},
		},
		transaction,
	}); // Lấy tất cả feedbacks
	const feedbacks = await db.feedbacks.count({ transaction });

	return { admins, customers, products, orders, feedbacks };
};
