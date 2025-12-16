import { Router } from 'express';

import authRoute from './auth.router';
import dashboard from './dashboard.router';
import admin from './admin.router';
import customer from './customer.router';
import manager from './manager.router';
import publicRoute from './public.router';
import product from './products.router';
import productVariant from './product-variants.router';
import carts from './carts.router';
import orders from './orders.router';

const router = Router();

router.use('/auth', authRoute);
router.use('/dashboard', dashboard);
router.use('/admin', admin);
router.use('/customer', customer);
router.use('/manager', manager);
router.use('/public', publicRoute);
router.use('/products', product);
router.use('/product-variant', productVariant);
router.use('/carts', carts);
router.use('/orders', orders);

router.use('/health', (req, res) => {
	return res.send('Server starting');
});

export { router };
