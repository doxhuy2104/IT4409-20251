import { Sequelize, Dialect } from 'sequelize';
import env from '../../env';

import { Categories } from '../models/categories.model';
import { Products } from '../models/products.model';
import { Customers } from '../models/customers.model';
import { Carts } from '../models/carts.model';
import { CartItems } from '../models/cart-items.model';
import { Orders } from '../models/orders.model';
import { OrderItems } from '../models/order-items.model';
import { Admins } from 'src/models/admins.model';
import { AdminLogs } from 'src/models/admin-log.model';

const dbConfig = env.database;

const isProduction = process.env.NODE_ENV === 'production';
const sslConfig = isProduction
	? {
		dialectOptions: {
			ssl: {
				require: true,
				rejectUnauthorized: false,
			},
		},
	}
	: {};

const sequelize = new Sequelize(
	dbConfig.name,
	dbConfig.username,
	dbConfig.password,
	{
		host: dbConfig.host,
		dialect: dbConfig.dialect as Dialect,
		port: dbConfig.port,
		pool: {
			max: dbConfig.max,
			min: dbConfig.min,
			acquire: dbConfig.acquire,
			idle: dbConfig.idle,
		},
		logging: dbConfig.logging,
	},
);

const connectToDatabase = async () => {
	try {
		await sequelize.authenticate();
		console.log('Connection has been established successfully.');
	} catch (error) {
		console.error('Unable to connect to the database:', error);
	}
};

// Khởi tạo tất cả các model
Admins.initClass(sequelize);
Categories.initClass(sequelize);
Products.initClass(sequelize);
Customers.initClass(sequelize);
Carts.initClass(sequelize);
CartItems.initClass(sequelize);
Orders.initClass(sequelize);
OrderItems.initClass(sequelize);
AdminLogs.initClass(sequelize);
// 1. Categories (có thể có danh mục cha)
Categories.belongsTo(Categories, { as: 'parent', foreignKey: 'parentId' });
Categories.hasMany(Categories, { as: 'subCategories', foreignKey: 'parentId' });

// 2. Products - Categories (mỗi sản phẩm thuộc một danh mục)
Products.belongsTo(Categories, { foreignKey: 'categoryId' });
Categories.hasMany(Products, { foreignKey: 'categoryId' });


// 8. Carts - Customers (mỗi giỏ hàng có thể thuộc một khách hàng)
Carts.belongsTo(Customers, { foreignKey: 'customerId' });
Customers.hasMany(Carts, { foreignKey: 'customerId' });

// 9. CartItems - Carts & ProductVariants (mỗi mục trong giỏ hàng thuộc một giỏ hàng và một biến thể)
CartItems.belongsTo(Carts, { foreignKey: 'cartId' });
Carts.hasMany(CartItems, { foreignKey: 'cartId' });


// 11. Orders - Customers & Warehouses (mỗi đơn hàng thuộc một khách hàng và có thể thuộc một kho)
Orders.belongsTo(Customers, { foreignKey: 'customerId' });
Customers.hasMany(Orders, { foreignKey: 'customerId' });

// 12. OrderItems - Orders & ProductVariants (mỗi mục đơn hàng thuộc một đơn hàng và một biến thể)
OrderItems.belongsTo(Orders, { foreignKey: 'orderId' });
Orders.hasMany(OrderItems, { foreignKey: 'orderId' });

// Xuất các model và kết nối
export const db = {
	sequelize: sequelize,
	admins: Admins,
	adminLogs: AdminLogs,
	categories: Categories,
	products: Products,
	customers: Customers,
	carts: Carts,
	cartItems: CartItems,
	orders: Orders,
	orderItems: OrderItems,
	connectToDatabase,
};
