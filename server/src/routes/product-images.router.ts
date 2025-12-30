import express from 'express';
import * as imageController from '../controllers/managers/product-images.controller';
import { isManager, verifyToken } from '../middlewares/authenticate.middleware';
import { authorization, RoleManager } from '../middlewares/manager.middleware';
// import { upload } from '../utility/media.util';
import { upload } from '../../utility/cloudinary.util';

const router = express.Router();

// Route để lấy danh sách ảnh của sản phẩm
router.get('/:productId', imageController.getProductImages);

router.use(isManager);
router.use(verifyToken);

// Route để upload ảnh cho sản phẩm
router.post(
	'/:productId',
	authorization([RoleManager.manager, RoleManager.staff]),
	upload.any(),
	imageController.uploadProductImage,
);

// Route để xóa ảnh sản phẩm
router.delete(
	'/:id',
	authorization([RoleManager.manager, RoleManager.staff]),
	imageController.deleteProductImage,
);

export default router;
