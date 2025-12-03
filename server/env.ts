import * as dotenv from 'dotenv';
import * as path from 'path';
import { description, name, version } from './package.json';

dotenv.config({
	path: path.join(process.cwd(), '.env'),
});

/**
 * Environment variables
 */

export default {
	app: {
		client_url: process.env.CLIENT_URL || 'http://localhost:3000',
		base_url: process.env.BASE_URL || 'http://localhost:3005',
		isProduction: process.env.NODE_ENV === 'production',
		root_path: path.join(process.cwd()),
		name,
		version,
		description,
		port: Number(process.env.PORT) || 3000,
		saltRounds: Number(process.env.SALT_ROUNDS) || 10,
		cors: process.env.CORS?.split(',') || ['http://localhost:3000'],
		jwtSecret: process.env.JWT_SECRET || 'secret',
		jwtSecretManager: process.env.JWT_SECRET_MANAGER || 'secret_manager',
		jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
		jwtRefreshSecretManager:
			process.env.JWT_REFRESH_SECRET_MANAGER || 'refresh_secret_manager',
		jwtExpiredIn: process.env.JWT_EXPIRED_IN || '1h',
		refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
		debugLog: process.env.DEBUG_LOG === 'true',
	},
	admin: {
		username: process.env.ADMIN_USERNAME || 'admin',
		password: process.env.ADMIN_PASSWORD || 'admin123',
		email: process.env.ADMIN_EMAIL || 'admin@example.com',
		phone: process.env.ADMIN_PHONE || '0987654321',
	},
	database: (() => {
		// Nếu có DATABASE_URL, parse nó để lấy thông tin
		if (process.env.DATABASE_URL) {
			const url = new URL(process.env.DATABASE_URL);
			return {
				url: process.env.DATABASE_URL,
				host: url.hostname,
				port: Number(url.port) || 5432,
				username: url.username,
				password: url.password,
				name: url.pathname.slice(1), // Bỏ dấu / ở đầu
				dialect: url.protocol?.replace(':', '').replace('postgresql', 'postgres') || 'postgres',
				max: Number(process.env.DB_POOL_MAX) || 5,
				min: Number(process.env.DB_POOL_MIN) || 0,
				acquire: Number(process.env.DB_POOL_ACQUIRE) || 30000,
				idle: Number(process.env.DB_POOL_IDLE) || 10000,
				logging: process.env.DB_LOGGING === 'true',
				isSync: process.env.DB_SYNC === 'false',
			};
		}
		// Nếu không có DATABASE_URL, sử dụng các biến riêng lẻ
		return {
			url: undefined,
			host: process.env.DB_HOST || 'localhost',
			port: Number(process.env.DB_PORT) || 5432,
			username: process.env.DB_USERNAME || 'postgres',
			password: process.env.DB_PASSWORD || '123456',
			name: process.env.DB_NAME || 'postgres',
			dialect: process.env.DB_DIALECT || 'postgres',
			max: Number(process.env.DB_POOL_MAX) || 5,
			min: Number(process.env.DB_POOL_MIN) || 0,
			acquire: Number(process.env.DB_POOL_ACQUIRE) || 30000,
			idle: Number(process.env.DB_POOL_IDLE) || 10000,
			logging: process.env.DB_LOGGING === 'true',
			isSync: process.env.DB_SYNC === 'false',
		};
	})(),
	mail: {
		host: process.env.MAIL_HOST || 'sandbox.smtp.mailtrap.io',
		port: process.env.MAIL_PORT || '2525',
		user: process.env.MAIL_USER || '740ba294e9d57f',
		pass: process.env.MAIL_PASS || 'd5ff0cc1a9a948',
		from: process.env.MAIL_FROM_NAME || 'Platform',
	},
	google: {
		clientID: process.env.GOOGLE_CLIENT_ID || '',
		clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
		callbackURL:
			process.env.BASE_URL + '/' + process.env.GOOGLE_CALLBACK_URL ||
			'http://localhost:3005/api/auth/google/callback',
	},
	payment: {
		// Casso (QR code payment)
		CASSO_API_URL: process.env.CASSO_API_URL || 'https://oauth.casso.vn/v2',
		CASSO_API_KEY: process.env.CASSO_API_KEY || '',
		CASSO_ACCESS_TOKEN: process.env.CASSO_ACCESS_TOKEN || '',
	},
};
