import { Router } from 'express';

import authRoute from './auth.router';
import dashboardRoute from './dashboard.router';
import adminRoute from './admin.router';
import customerRoute from './customer.router';
import managerRoute from './manager.router';
import publicRoute from './public.router';
import product from './products.router';
import productVariant from './product-variants.router';
import carts from './carts.router';
import orders from './orders.router';

const router = Router();

router.use('/auth', authRoute);
router.use('/dashboard', dashboardRoute);
router.use('/admin', adminRoute);
router.use('/customer', customerRoute);
router.use('/manager', managerRoute);
router.use('/public', publicRoute);
router.use('/products', product);
router.use('/product-variant', productVariant);
router.use('/carts', carts);
router.use('/orders', orders);

router.use('/health', (req, res) => {
	return res.send('Server starting');
});

export { router };
