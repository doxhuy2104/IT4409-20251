import express from 'express';
import * as productsManagers from '../controllers/managers/products.controller';
import * as productsCustomers from '../controllers/customers/products.controller';
import { isManager, verifyToken } from '../middleware/authenticate.middleware';
import { authorization, RoleManager } from '../middleware/manager.middleware';
import * as wishlist from '../controllers/customers/wishlists.controller';
// import { upload } from '../utility/media.util';
import { upload } from '../utility/cloudinary.util';

const router = express.Router();

// Router cho customers (lấy ra sản phẩm)
router.get('/', productsCustomers.getProducts);

// Wishlist cho customer
router.get('/wishlist', verifyToken, wishlist.getAllWishlists);
router.post('/wishlist/:id', verifyToken, wishlist.createWishlist);
router.delete('/wishlist/:id', verifyToken, wishlist.deleteWishlist);

// Router cho managers
router.post(
	'/',
	isManager,
	verifyToken,
	authorization([RoleManager.manager, RoleManager.staff]),
	upload.any(),
	productsManagers.createProduct,
);
router.put(
	'/:id',
	isManager,
	verifyToken,
	authorization([RoleManager.manager, RoleManager.staff]),
	upload.any(),
	productsManagers.updateProduct,
);
router.delete(
	'/:id',
	isManager,
	verifyToken,
	authorization([RoleManager.manager, RoleManager.staff]),
	productsManagers.deleteProduct,
);

export default router;
