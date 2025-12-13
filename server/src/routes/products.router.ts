import express from 'express';

import * as productsCustomers from '../controllers/customers/products.controller';
import * as wishlist from '../controllers/customers/wishlists.controller';
// import { upload } from '../utility/media.util';
import { upload } from '../utility/cloudinary.util';
	
const router = express.Router();

// Router cho customers (lấy ra sản phẩm)
router.get('/', productsCustomers.getProducts);

export default router;
