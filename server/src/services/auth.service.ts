import jwt from 'jsonwebtoken';
import env from '../../env';
import { CONFLICT_ERROR } from '../constants/error.constant';
import { db } from '../loaders/database.loader';
import { Customers } from '../models/customers.model';
import { AppError } from '../../utility/app.error.util';
import { encryptUtil } from '../../utility/encrypt.password.util';
import { sendMail } from '../../utility/mail.util';
import { verifyEmail } from '../../utility/verify.email.util';
import { Admins } from '../models/admins.model';
import { Op } from 'sequelize';


export async function authenticate(
	email: string,
	password: string,
	isAdmin: boolean = false,
): Promise<Customers | Admins> {
	const user = isAdmin
		? await db.admins.findOne({ where: { email: email } })
		: await db.customers.findOne({ where: { email: email } });
	if (user == null) {
		throw new AppError(CONFLICT_ERROR, 'email or password mismatch');
	}
	if (!user.isActive) {
		throw new AppError(CONFLICT_ERROR, 'User is not active');
	}
	if (!isAdmin && (user as Customers).isBlock) {
		throw new AppError(CONFLICT_ERROR, 'User is blocked');
	}
	const isMatch = await encryptUtil.comparePassword(password, user.passwordHash);

	if (!isMatch) {
		throw new AppError(CONFLICT_ERROR, 'email or password mismatch');
	}

	return user;
}

export async function authenticateGoogle(googleId: string): Promise<Customers> {
	const user = await db.customers.findOne({
		where: { googleId: googleId },
	});

	if (user == null) {
		throw new AppError(CONFLICT_ERROR, 'Người dùng không tồn tại');
	}

	if (!user.isActive) {
		throw new AppError(CONFLICT_ERROR, 'Tài khoản chưa được kích hoạt');
	}

	return user;
}

export function getAccessToken(
	user: Customers | Admins,
	expiresIn: any,
	isAdmin = false,
): string {
	let payload: any = {
		id: user.id,
		email: user.email,
	};
	if (!isAdmin) {
		payload.isBlock = (user as Customers).isBlock;
	}
	return jwt.sign(
		payload,
		isAdmin ? env.app.jwtSecretManager : (env.app.jwtSecret as any),
		{
			expiresIn,
		},
	);
}

export function getRefreshToken(
	user: Customers | Admins,
	isAdmin = false,
): string {
	return jwt.sign(
		{
			id: user.id,
			email: user.email,
		},
		isAdmin
			? env.app.jwtRefreshSecretManager
			: (env.app.jwtRefreshSecret as any),
		{
			expiresIn: env.app.refreshTokenExpiry as any,
		},
	);
}

export function getToken(
	user: Customers | Admins,
	expiresIn: any,
	isAdmin = false,
): string {
	return getAccessToken(user, expiresIn, isAdmin);
}

export async function refreshAccessToken(
	refreshToken: string,
	isAdmin = false,
): Promise<{
	accessToken: string;
	refreshToken: string;
	user: Customers | Admins;
}> {
	try {
		const payload = jwt.verify(
			refreshToken,
			isAdmin
				? env.app.jwtRefreshSecretManager
				: (env.app.jwtRefreshSecret as any),
		) as any;

		const user = isAdmin
			? await db.admins.findOne({ where: { id: payload.id } })
			: await db.customers.findOne({ where: { id: payload.id } });
		if (!user) {
			throw new AppError(CONFLICT_ERROR, 'Invalid refresh token');
		}

		const accessToken = getAccessToken(user, env.app.jwtExpiredIn, isAdmin);
		const newRefreshToken = getRefreshToken(user, isAdmin);
		return { accessToken, refreshToken: newRefreshToken, user };
	} catch (error) {
		throw new AppError(CONFLICT_ERROR, 'Invalid refresh token');
	}
}

export async function register(data: any): Promise<Customers> {
	const user = await db.customers.findOne({
		where: {
			[Op.or]: [{ email: data.email }, { phone: data.phone }],
		},
	});
	if (user) {
		throw new AppError(CONFLICT_ERROR, 'User already exists');
	}
	const passwordHash = await encryptUtil.createHash(data.password);
	data.passwordHash = passwordHash;
	const newUser = await db.customers.create(data);
	const verityToken = getToken(newUser, env.app.jwtExpiredIn);
	const html = verifyEmail(verityToken, newUser.email);
	await sendMail(newUser.email, 'email verification', undefined, html);

	return newUser;
}

export async function createOrUpdateUserFromGoogle(
	profile: any,
): Promise<Customers> {
	// Tìm kiếm người dùng theo googleId
	let user = await db.customers.findOne({
		where: { googleId: profile.id },
	});

	// Nếu không tìm thấy, tìm theo email
	if (!user && profile.emails && profile.emails.length > 0) {
		const email = profile.emails[0].value;
		user = await db.customers.findOne({
			where: { email },
		});

		// Nếu tìm thấy người dùng với email đó, cập nhật googleId
		if (user) {
			user.googleId = profile.id;
			await user.save();
		} else {
			// Tạo người dùng mới nếu chưa tồn tại
			const randomPassword = Math.random().toString(36).slice(-8);
			const passwordHash = await encryptUtil.createHash(randomPassword);

			user = await db.customers.create({
				email: profile.emails[0].value,
				fullName: profile.displayName || '',
				googleId: profile.id,
				passwordHash,
				isActive: true, // Đã xác minh qua Google
			});
		}
	}

	if (!user) {
		throw new AppError(CONFLICT_ERROR, 'Không thể tạo tài khoản từ Google');
	}

	return user;
}

export async function verify(token: string, email: string): Promise<Customers> {
	const user = jwt.verify(token, env.app.jwtSecret) as Customers;
	const userDb = await db.customers.findOne({
		where: { id: user.id, email: user.email },
	});
	if (userDb == null) {
		throw new AppError(CONFLICT_ERROR, 'User not found');
	}
	if (userDb.email !== email) {
		throw new AppError(CONFLICT_ERROR, 'User not found');
	}
	userDb.isActive = true;
	return await userDb.save();
}

export async function forgotPassword(email: string): Promise<boolean> {
	const user = await db.customers.findOne({ where: { email } });
	if (!user) {
		throw new AppError(CONFLICT_ERROR, 'User not found');
	}

	const resetToken = getToken(user, '1h');
	const resetUrl = `${env.app.client_url}/reset-password?token=${resetToken}&email=${email}`;

	const html = `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Đặt Lại Mật Khẩu</title>
		</head>
		<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9;">
			<div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.05); margin-top: 40px; margin-bottom: 40px;">
				<!-- Header -->
				<div style="background-color: #38c85aff; padding: 30px 20px; text-align: center;">
					<h1 style="color: white; margin: 0; font-size: 24px;">Đặt Lại Mật Khẩu</h1>
				</div>

				<!-- Body -->
				<div style="padding: 30px 20px; color: #333333;">
					<p style="margin-top: 0; font-size: 16px;">Xin chào ${
						user.fullName || 'Quý khách'
					},</p>

					<p style="font-size: 16px; line-height: 1.5;">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng nhấp vào nút bên dưới để tiếp tục:</p>

					<div style="text-align: center; margin: 30px 0;">
						<a href="${resetUrl}" style="display: inline-block; background-color: #40c73dff; color: white; font-weight: bold; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-size: 16px;">Đặt Lại Mật Khẩu</a>
					</div>

					<p style="font-size: 16px; line-height: 1.5;">Nếu bạn không thể nhấp vào nút trên, hãy sao chép và dán đường dẫn dưới đây vào trình duyệt của bạn:</p>

					<p style="background-color: #f5f5f5; padding: 12px; border-radius: 4px; font-size: 14px; word-break: break-all;">${resetUrl}</p>

					<p style="font-size: 16px; line-height: 1.5; color: #757575;">Lưu ý: Liên kết này sẽ hết hạn sau 1 giờ kể từ khi email được gửi.</p>

					<p style="font-size: 16px; line-height: 1.5;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi nếu bạn có bất kỳ thắc mắc nào.</p>
				</div>

				<!-- Footer -->
				<div style="padding: 20px; text-align: center; background-color: #f5f5f5; color: #757575; font-size: 14px; border-top: 1px solid #eeeeee;">
					<p style="margin: 0;">© ${new Date().getFullYear()} ${
		env.app.name || 'Company Name'
	}. Tất cả các quyền được bảo lưu.</p>
				</div>
			</div>
		</body>
		</html>
	`;

	await sendMail(email, 'Đặt lại mật khẩu', undefined, html);
	return true;
}

export async function resetPassword(
	token: string,
	email: string,
	newPassword: string,
): Promise<boolean> {
	try {
		const decoded = jwt.verify(token, env.app.jwtSecret) as any;
		const user = await db.customers.findOne({
			where: { id: decoded.id, email },
		});

		if (!user) {
			throw new AppError(
				CONFLICT_ERROR,
				'User not found or invalid token',
			);
		}

		user.passwordHash = await encryptUtil.createHash(newPassword);
		await user.save();
		return true;
	} catch (error) {
		throw new AppError(CONFLICT_ERROR, 'Invalid or expired token');
	}
}

export async function getMe(
	id: string,
	isAdmin: boolean,
): Promise<Customers | Admins> {
	const user = isAdmin
		? await db.admins.findOne({
				where: { id },
				attributes: { exclude: ['passwordHash'] },
		  })
		: await db.customers.findOne({
				where: { id },
				attributes: { exclude: ['passwordHash'] },
		  });
	if (!user) {
		throw new AppError(CONFLICT_ERROR, 'User not found');
	}
	return user;
}
