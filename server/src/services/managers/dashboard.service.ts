import { db } from '../../loaders/database.loader';
import { Transaction, Op } from 'sequelize';

export const getAllDashboard = async (transaction?: Transaction) => {
	
	const admins = await db.admins.count({ transaction });
	
	const customers = await db.customers.count({ transaction });
	
	const products = await db.products.count({ transaction });
	
	const now = new Date();
	const oneMonthAgo = new Date();
	oneMonthAgo.setMonth(now.getMonth() - 1); 

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
