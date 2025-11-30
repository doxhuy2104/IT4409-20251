import * as dotenv from 'dotenv';
import * as path from 'path';
import { description, name, version } from './package.json';

dotenv.config({
	path: path.join(process.cwd(), '.env'),
});

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
	database: {
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
	},
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
		// VNPay
		VNPAY_TMN_CODE: process.env.VNPAY_TMN_CODE || '',
		VNPAY_SECRET_KEY:
			process.env.VNPAY_SECRET_KEY || 'WL10DVN5EE3R76SZ9DVUF9AK4P9IJR15',
		VNPAY_URL:
			process.env.VNPAY_URL ||
			'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
		VNPAY_RETURN_URL:
			process.env.VNPAY_RETURN_URL ||
			'http://localhost:3005/api/payments/vnpay/callback',

		// MoMo
		MOMO_PARTNER_CODE: process.env.MOMO_PARTNER_CODE || '',
		MOMO_ACCESS_KEY: process.env.MOMO_ACCESS_KEY || '',
		MOMO_SECRET_KEY: process.env.MOMO_SECRET_KEY || '',
		MOMO_API_ENDPOINT:
			process.env.MOMO_API_ENDPOINT ||
			'https://test-payment.momo.vn/v2/gateway/api/create',
		MOMO_RETURN_URL:
			process.env.MOMO_RETURN_URL ||
			'http://localhost:3005/api/payments/momo/callback',
		MOMO_NOTIFY_URL:
			process.env.MOMO_NOTIFY_URL ||
			'http://localhost:3005/api/payments/momo/notify',

		// PayPal
		PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID || '',
		PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET || '',
		PAYPAL_MODE: process.env.PAYPAL_MODE || 'sandbox',
	},
};
