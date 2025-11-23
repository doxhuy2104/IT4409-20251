import express from 'express';
import * as order from '../controllers/customers/orders.controller';

const router = express.Router();

router.get('/customer', order.getOrders); // Lấy của khách hàng
router.post('/confirm/:id', order.confirmOrder); // Xác nhận đơn hàng
router.put('/cancel/:id', order.cancelOrder); // hủy đơn hàng
router.post('/', order.createOrder); // Tạo đơn hàng mới
router.put('/:id', order.updateOrderById); // Cập nhật đơn hàng theo ID
router.delete('/:id', order.deleteOrderById); // Xóa đơn hàng theo ID

export default router;
