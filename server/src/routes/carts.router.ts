import express from 'express';
import * as cartController from '../controllers/customers/carts.controller';
import { verifyToken } from '../middleware/authenticate.middleware';

const router = express.Router();
router.use(verifyToken)

router.get('/', cartController.getCartWithItems); // Lấy giỏ hàng + sản phẩm trong giỏ theo customerId
router.post('/', cartController.addItemToCart); // Thêm sản phẩm vào giỏ hàng (hoặc tăng số lượng nếu đã có)
router.put('/:itemId', cartController.updateCartItemQuantity); // Cập nhật số lượng sản phẩm trong giỏ hàng
router.delete('/clear', cartController.clearCart); // Xoá toàn bộ sản phẩm khỏi giỏ hàng
router.delete('/:itemId', cartController.removeItemFromCart); // Xoá một sản phẩm khỏi giỏ hàng

export default router;
