import { Transaction, Op } from 'sequelize';
import { db } from '../../loaders/database.loader';

export const getAdminLogs = async (filters: any, transaction?: Transaction) => {
	const where: any = {};

	// Điều kiện lọc 
	if (filters.adminId) {
		where.adminId = filters.adminId;
	}

	if (filters.action) {
		where.action = { [Op.like]: `%${filters.action}%` };
	}

	if (filters.entityType) {
		where.entityType = { [Op.like]: `%${filters.entityType}%` };
	}

	if (filters.entityId) {
		where.entityId = filters.entityId;
	}

	if (filters.details) {
		where.details = { [Op.like]: `%${filters.details}%` };
	}
	if (filters.fromDate && filters.toDate) {
		where.createdAt = {
			[Op.between]: [filters.fromDate, filters.toDate],
		};
	} else if (filters.fromDate) {
		where.createdAt = {
			[Op.gte]: filters.fromDate,
		};
	} else if (filters.toDate) {
		where.createdAt = {
			[Op.lte]: filters.toDate,
		};
	}

	// Lấy dữ liệu từ cơ sở dữ liệu
	const [rows, count] = await Promise.all([
		db.adminLogs.findAll({
			where,
			include: [
				{
					model: db.admins,
					attributes: ['username', 'email'],
					where: {
						...(filters.username && {
							username: { [Op.like]: `%${filters.username}%` },
						}),
						...(filters.email && {
							email: { [Op.like]: `%${filters.email}%` },
						}),
					},
					required: true,
				},
			],
			limit: filters.limit,
			offset: filters.offset,
			transaction,
		}),
		db.adminLogs.count({
			where,
			transaction,
		}),
	]);

	return [rows, count];
};

export const CreateAdminLog = async (
	adminId: number,
	action: string,
	entityId: number,
	entityType: string,
	data: any,
	transaction?: Transaction,
) => {
	const details = JSON.stringify(data);
	await db.adminLogs.create(
		{ adminId, action, entityId, entityType, details },
		{ transaction },
	);
};

export const deleteAdminLog = async (
	id: number,
	transaction?: Transaction,
) => {
	const adminLog = await db.adminLogs.findByPk(id, { transaction });

	if (!adminLog) {
		throw new Error('ADMIN_LOG_NOT_FOUND');
	}

	await adminLog.destroy({ transaction });
	return true;
};
