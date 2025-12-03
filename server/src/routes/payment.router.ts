import express from 'express';
import PaymentController from '../controllers/payment.controller';

const router = express.Router();

// Check payment from Casso (QR code)
router.get('/check/:orderId', PaymentController.checkPayment);

export default router;
