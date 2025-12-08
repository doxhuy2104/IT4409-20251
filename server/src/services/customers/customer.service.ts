import { db } from '../../loaders/database.loader';
import { Customers } from '../../models/customers.model';
import { CONFLICT_ERROR } from '../../constants/error.constant';
import { AppError } from '../../../utility/app.error.util';
import { Op } from 'sequelize';

export async function updateProfile(id: string, data: Partial<Customers>) {
	const user = await db.customers.findOne({
		where: { id },
		attributes: { exclude: ['passwordHash'] },
	});
	if (!user) {
		throw new AppError(CONFLICT_ERROR, 'User not found');
	}
	const or = [];
	if (data.email) {
		or.push({ email: data.email });
	}
	if (data.phone) {
		or.push({ phone: data.phone });
	}
	if (or.length > 0) {
		const existingUser = await db.customers.findOne({
			where: {
				[Op.or]: or,
			},
		});
		if (existingUser && existingUser.id !== user.id) {
			throw new AppError(CONFLICT_ERROR, 'Email or phone already exists');
		}
	}
	return await user.update(data);
}
