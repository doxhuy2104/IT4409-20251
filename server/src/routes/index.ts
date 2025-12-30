import { Router } from 'express';

import authRoute from './auth.router';
import publicRoute from './public.router';
import accountRoute from './admin.router';
import product from './products.router';
import carts from './carts.router';
import orders from './orders.router';
import productImages from './product-images.router';
import managerRoute from './manager.router';
import customerRoute from './customer.router';
import paymentRoute from './payment.router';
import feedbackRoute from './feedbacks.router';
import reviewRoute from './reviews.router';
import promotionRoute from './promotions.router';
import dashboardRoute from './dashboard.router';

const router = Router();

router.use('/auth', authRoute);
router.use('/public', publicRoute);
router.use('/account', accountRoute);
router.use('/products', product);
router.use('/carts', carts);
router.use('/orders', orders);
router.use('/images', productImages);
router.use('/manager', managerRoute);
router.use('/customer', customerRoute);
router.use('/payments', paymentRoute);
router.use('/feedbacks', feedbackRoute);
router.use('/reviews', reviewRoute);
router.use('/promotions', promotionRoute);
router.use('/dashboard', dashboardRoute);

router.use('/health', (req, res) => {
	return res.send('Server starting');
});

export { router };
