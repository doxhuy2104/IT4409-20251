import { Transaction, Op } from 'sequelize';
import { db } from '../../loaders/database.loader';
import bcrypt from 'bcryptjs';
import { CONFLICT_ERROR } from 'src/constants/error.constant';
import { AppError } from '../../../utility/app.error.util';

export const getAdmin = async (filters: any, transaction?: Transaction) => {
	const where: any = {};

	if (filters.id) {
		where.id = filters.id;
	}

	// Điều kiện lọc
	if (filters.username) {
		where.username = { [Op.like]: `%${filters.username}%` };
	}

	if (filters.fullName) {
		where.fullName = { [Op.like]: `%${filters.fullName}%` };
	}

	if (filters.email) {
		where.email = { [Op.like]: `%${filters.email}%` };
	}

	if (filters.phone) {
		where.phone = { [Op.like]: `%${filters.phone}%` };
	}
	if (filters.role) {
		where.role = { [Op.like]: `%${filters.role}%` };
	}

	// Lấy dữ liệu từ cơ sở dữ liệu với phân trang
	const [rows, count] = await Promise.all([
		db.admins.findAll({
			where,
			attributes: {
				exclude: ['passwordHash'],
			},
			limit: filters.limit,
			offset: filters.offset,
			transaction,
		}),
		db.admins.count({
			where,
			transaction,
		}),
	]);

	return [rows, count];
};

export const createAccount = async (data: any, transaction?: Transaction) => {
	const { username, email, phone, role, fullName, password } = data;

	if (!username || !email || !phone || !role || !password) {
		throw new Error('Thiếu thông tin bắt buộc để tạo tài khoản');
	}

    const manager = await db.admins.findOne({
            where: {
                [Op.or]: [{ email: data.email }, { phone: data.phone }, {username: data.username}],
            },
        });
        if (manager) {
            throw new AppError(CONFLICT_ERROR, 'Manager already exists');
        }

	// Mã hóa mật khẩu nếu có sử dụng bcrypt (tùy theo hệ thống)
	const hashedPassword = await bcrypt.hash(password, 10);

	const newAccount = await db.admins.create(
		{
			username,
			email,
			phone,
			role,
			fullName,
			passwordHash: hashedPassword,
		},
		{ transaction },
	);

	let plainAccount = newAccount.toJSON() as any;
	delete plainAccount.passwordHash;

	return plainAccount;
};

// Cập nhật tài khoản admin
export const updateAccount = async (
	id: number,
	data: any,
	transaction?: Transaction,
) => {
	const admin = await db.admins.findByPk(id, { transaction });
	if (!admin) throw new Error('Admin không tồn tại');

	const { username, email, phone, fullName, role } = data;

	if (username && username !== admin.username) {
		const exists = await db.admins.findOne({
			where: { username },
			transaction,
		});
		if (exists) throw new Error('Username đã tồn tại');
	}
	if (role && admin.role === 'super_admin') {
		throw new Error('Không thể thay đổi vai trò của tài khoản admin');
	}

	if (email && email !== admin.email) {
		const exists = await db.admins.findOne({
			where: { email },
			transaction,
		});
		if (exists) throw new Error('Email đã tồn tại');
	}

	if (phone && phone !== admin.phone) {
		const exists = await db.admins.findOne({
			where: { phone },
			transaction,
		});
		if (exists) throw new Error('Số điện thoại đã tồn tại');
	}

	await admin.update(
		{ username, email, phone, fullName, role },
		{ transaction },
	);

	let plainAccount = admin.toJSON() as any;
	delete plainAccount.passwordHash;

	return plainAccount;
};

// Xóa tài khoản admin
export const deleteAccount = async (id: number, transaction?: Transaction) => {
	const admin = await db.admins.findByPk(id, { transaction });
	if (!admin) throw new Error('Tài khoản không tồn tại');

	if (admin.role === 'super_admin')
		throw new Error('Không thể xóa tài khoản này');

	await admin.destroy({ transaction });
	return { message: 'Tài khoản đã được xóa thành công' };
};
