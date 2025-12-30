import { Dialect, Sequelize } from 'sequelize';
import env from '../../env';

// Import tất cả các model
import { AdminLogs } from '../models/admin-log.model';
import { Admins } from '../models/admins.model';
import { BrandCategories } from '../models/brand-categories.model';
import { Brands } from '../models/brands.model';
import { CartItems } from '../models/cart-items.model';
import { Carts } from '../models/carts.model';
import { Categories } from '../models/categories.model';
import { Customers } from '../models/customers.model';
import { Feedbacks } from '../models/feedbacks.model';
import { Inventory } from '../models/inventory.model';
import { OrderItems } from '../models/order-items.model';
import { Orders } from '../models/orders.model';
import { Payments } from '../models/payments.model';
import { ProductImages } from '../models/product-images.model';
import { ProductPromotions } from '../models/product-promotions.model';
import { Products } from '../models/products.model';
import { Promotions } from '../models/promotions.model';
import { Revenue } from '../models/revenue.model';
import { Reviews } from '../models/reviews.model';
import { Shipping } from '../models/shipping.model';
import { Warehouses } from '../models/warehouses.model';
import { Wishlists } from '../models/wishlists.model';

const dbConfig = env.database;

// SSL configuration for production (required for cloud databases like Render)
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

// Sử dụng DATABASE_URL nếu có, nếu không thì dùng config riêng lẻ
const sequelize = dbConfig.url
	? new Sequelize(dbConfig.url, {
		dialect: dbConfig.dialect as Dialect,
		pool: {
			max: dbConfig.max,
			min: dbConfig.min,
			acquire: dbConfig.acquire,
			idle: dbConfig.idle,
		},
		logging: dbConfig.logging,
		...sslConfig,
	})
	: new Sequelize(
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
			...sslConfig,
		},
	);

const connectToDatabase = async () => {
	try {
		await sequelize.authenticate();
		// if (dbConfig.isSync) await sequelize.sync({ alter: true });
		console.log('Connection has been established successfully.');
	} catch (error) {
		console.error('Unable to connect to the database:', error);
	}
};

// Khởi tạo tất cả các model
Categories.initClass(sequelize);
Brands.initClass(sequelize);
BrandCategories.initClass(sequelize);
Products.initClass(sequelize);
ProductImages.initClass(sequelize);
Customers.initClass(sequelize);
Carts.initClass(sequelize);
CartItems.initClass(sequelize);
Wishlists.initClass(sequelize);
Orders.initClass(sequelize);
OrderItems.initClass(sequelize);
Reviews.initClass(sequelize);
Promotions.initClass(sequelize);
ProductPromotions.initClass(sequelize);
Admins.initClass(sequelize);
AdminLogs.initClass(sequelize);
Warehouses.initClass(sequelize);
Inventory.initClass(sequelize);
Feedbacks.initClass(sequelize);
Payments.initClass(sequelize);
Shipping.initClass(sequelize);
Revenue.initClass(sequelize);

// Định nghĩa các mối quan hệ giữa các bảng

// 1. Categories (có thể có danh mục cha)
Categories.belongsTo(Categories, { as: 'parent', foreignKey: 'parentId' });
Categories.hasMany(Categories, { as: 'subCategories', foreignKey: 'parentId' });

// 2. Brands - Categories (mỗi thương hiệu thuộc nhiều danh mục)
Brands.belongsToMany(Categories, { through: BrandCategories });
Categories.belongsToMany(Brands, { through: BrandCategories });

// 2. Products - Categories (mỗi sản phẩm thuộc một danh mục)
Products.belongsTo(Categories, { foreignKey: 'categoryId' });
Categories.hasMany(Products, { foreignKey: 'categoryId' });

// 3. Products - Brands (mỗi sản phẩm thuộc một thương hiệu)
Products.belongsTo(Brands, { foreignKey: 'brandId' });
Brands.hasMany(Products, { foreignKey: 'brandId' });

// 7. ProductImages - Products (mỗi ảnh thuộc một sản phẩm)
ProductImages.belongsTo(Products, { foreignKey: 'productId' });
Products.hasMany(ProductImages, { foreignKey: 'productId' });


// 8. Carts - Customers (mỗi giỏ hàng có thể thuộc một khách hàng)
Carts.belongsTo(Customers, { foreignKey: 'customerId' });
Customers.hasMany(Carts, { foreignKey: 'customerId' });

// 9. CartItems - Carts & Products (mỗi mục trong giỏ hàng thuộc một giỏ hàng và một sản phẩm)
CartItems.belongsTo(Carts, { foreignKey: 'cartId' });
CartItems.belongsTo(Products, { foreignKey: 'productId' });
Carts.hasMany(CartItems, { foreignKey: 'cartId' });
Products.hasMany(CartItems, { foreignKey: 'productId' });

// 10. Wishlists - Customers & Products (mỗi mục yêu thích thuộc một khách hàng và một sản phẩm)
Wishlists.belongsTo(Customers, { foreignKey: 'customerId' });
Wishlists.belongsTo(Products, { foreignKey: 'productId' });
Customers.hasMany(Wishlists, { foreignKey: 'customerId' });
Products.hasMany(Wishlists, { foreignKey: 'productId' });

// 11. Orders - Customers & Warehouses (mỗi đơn hàng thuộc một khách hàng và có thể thuộc một kho)
Orders.belongsTo(Customers, { foreignKey: 'customerId' });
Orders.belongsTo(Warehouses, { foreignKey: 'warehouseId' });
Customers.hasMany(Orders, { foreignKey: 'customerId' });
Warehouses.hasMany(Orders, { foreignKey: 'warehouseId' });

// 12. OrderItems - Orders & Products (mỗi mục đơn hàng thuộc một đơn hàng và một sản phẩm)
OrderItems.belongsTo(Orders, { foreignKey: 'orderId' });
OrderItems.belongsTo(Products, { foreignKey: 'productId' });
Orders.hasMany(OrderItems, { foreignKey: 'orderId' });
Products.hasMany(OrderItems, { foreignKey: 'productId' });

// 13. Reviews - Customers & Products (mỗi đánh giá thuộc một khách hàng và một sản phẩm)
Reviews.belongsTo(Customers, { foreignKey: 'customerId' });
Reviews.belongsTo(Products, { foreignKey: 'productId' });
Customers.hasMany(Reviews, { foreignKey: 'customerId' });
Products.hasMany(Reviews, { foreignKey: 'productId' });

// 14. ProductPromotions - Products & Promotions (bảng nối nhiều-nhiều)
ProductPromotions.belongsTo(Products, { foreignKey: 'productId' });
ProductPromotions.belongsTo(Promotions, { foreignKey: 'promotionId' });
Products.hasMany(ProductPromotions, { foreignKey: 'productId' });
Promotions.hasMany(ProductPromotions, { foreignKey: 'promotionId' });

// 15. AdminLogs - Admins (mỗi log thuộc một quản trị viên)
AdminLogs.belongsTo(Admins, { foreignKey: 'adminId' });
Admins.hasMany(AdminLogs, { foreignKey: 'adminId' });

// 16. Inventory - Warehouses & Products (mỗi mục tồn kho thuộc một kho và một sản phẩm)
Inventory.belongsTo(Warehouses, { foreignKey: 'warehouseId' });
Inventory.belongsTo(Products, { foreignKey: 'productId' });
Warehouses.hasMany(Inventory, { foreignKey: 'warehouseId' });
Products.hasMany(Inventory, { foreignKey: 'productId' });

// 17. Feedbacks - Customers (mỗi phản hồi có thể thuộc một khách hàng)
Feedbacks.belongsTo(Customers, { foreignKey: 'userId' });
Customers.hasMany(Feedbacks, { foreignKey: 'userId' });

// 18. Payments - Orders (mỗi thanh toán thuộc một đơn hàng)
Payments.belongsTo(Orders, { foreignKey: 'orderId' });
Orders.hasMany(Payments, { foreignKey: 'orderId' });

// 19. Shipping - Orders (mỗi vận chuyển thuộc một đơn hàng)
Shipping.belongsTo(Orders, { foreignKey: 'orderId' });
Orders.hasOne(Shipping, { foreignKey: 'orderId' }); // Một đơn hàng chỉ có một thông tin vận chuyển

// Xuất các model và kết nối
export const db = {
	sequelize: sequelize,
	categories: Categories,
	brands: Brands,
	brandCategories: BrandCategories,
	products: Products,
	productImages: ProductImages,
	customers: Customers,
	carts: Carts,
	cartItems: CartItems,
	wishlists: Wishlists,
	orders: Orders,
	orderItems: OrderItems,
	reviews: Reviews,
	promotions: Promotions,
	productPromotions: ProductPromotions,
	admins: Admins,
	adminLogs: AdminLogs,
	warehouses: Warehouses,
	inventory: Inventory,
	feedbacks: Feedbacks,
	payments: Payments,
	shipping: Shipping,
	revenue: Revenue,
	connectToDatabase,
};
