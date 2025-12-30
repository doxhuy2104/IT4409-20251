const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
	path: path.join(process.cwd(), '.env'),
});

// Hàm parse DATABASE_URL
function parseDatabaseUrl(url) {
	if (!url) return null;
	try {
		const parsed = new URL(url);
		return {
			username: parsed.username,
			password: parsed.password,
			database: parsed.pathname.slice(1), // Bỏ dấu / ở đầu
			host: parsed.hostname,
			port: parsed.port || 5432,
			dialect: parsed.protocol?.replace(':', '').replace('postgresql', 'postgres') || 'postgres',
		};
	} catch (error) {
		return null;
	}
}

// Parse DATABASE_URL nếu có
const dbUrlConfig = parseDatabaseUrl(
	process.env.DATABASE_URL || process.env.PROD_DATABASE_URL
);

const config = {
	development: (() => {
		const devUrl = parseDatabaseUrl(process.env.DATABASE_URL);
		if (devUrl) {
			return {
				username: devUrl.username,
				password: devUrl.password,
				database: devUrl.database,
				host: devUrl.host,
				port: devUrl.port,
				dialect: devUrl.dialect,
			};
		}
		return {
			username: process.env.DB_USERNAME,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
			host: process.env.DB_HOST,
			port: process.env.DB_PORT,
			dialect: process.env.DB_DIALECT,
		};
	})(),
	test: {
		username: process.env.CI_DB_USERNAME,
		password: process.env.CI_DB_PASSWORD,
		database: process.env.CI_DB_NAME,
		host: '127.0.0.1',
		port: 3306,
		dialect: process.env.DB_DIALECT,
		dialectOptions: {
			bigNumberStrings: true,
		},
	},
	production: (() => {
		// SSL configuration for production (required for cloud databases like Render)
		const sslConfig = {
			dialectOptions: {
				ssl: {
					require: true,
					rejectUnauthorized: false,
				},
			},
		};

		// Ưu tiên DATABASE_URL hoặc PROD_DATABASE_URL
		if (dbUrlConfig) {
			return {
				username: dbUrlConfig.username,
				password: dbUrlConfig.password,
				database: dbUrlConfig.database,
				host: dbUrlConfig.host,
				port: dbUrlConfig.port,
				dialect: dbUrlConfig.dialect,
				...sslConfig,
			};
		}
		// Fallback về các biến riêng lẻ
		return {
			username: process.env.PROD_DB_USERNAME || process.env.DB_USERNAME,
			password: process.env.PROD_DB_PASSWORD || process.env.DB_PASSWORD,
			database: process.env.PROD_DB_NAME || process.env.DB_NAME,
			host: process.env.PROD_DB_HOSTNAME || process.env.DB_HOST,
			port: process.env.PROD_DB_PORT || process.env.DB_PORT,
			dialect: process.env.PROD_DB_DIALECT || process.env.DB_DIALECT || 'postgres',
			...sslConfig,
		};
	})(),
};

module.exports = {
	...config,
};
