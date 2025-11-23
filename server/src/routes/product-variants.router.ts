import express from 'express';
import * as variantsManagers from '../../controllers/managers/product-variants.controller';
import * as variantsCustomers from '../controllers/customers/product-variants.controller';
import { isManager, verifyToken } from '../middleware/authenticate.middleware';
import { authorization, RoleManager } from '../middleware/manager.middleware';
// import { upload } from '../utility/media.util';
import { upload } from '../utility/cloudinary.util';

const router = express.Router();

// Router cho customers (Khách hàng tìm kiếm biến thể sản phẩm)
router.get('/', variantsCustomers.getVariants); // Tìm biến thể sản phẩm

router.use(isManager);
router.use(verifyToken);

// Router cho managers (Quản lý biến thể sản phẩm)
router.post(
	'/',
	authorization([RoleManager.manager, RoleManager.staff]),
	upload.any(),
	variantsManagers.createVariant,
); // Tạo biến thể sản phẩm mới
router.put(
	'/:id',
	authorization([RoleManager.manager, RoleManager.staff]),
	upload.any(),
	variantsManagers.updateVariant,
); // Cập nhật biến thể sản phẩm
router.delete(
	'/:id',
	authorization([RoleManager.manager, RoleManager.staff]),
	variantsManagers.deleteVariant,
); // Xoá biến thể sản phẩm

// Router cho managers (Quản lý thuộc tính biến thể sản phẩm)
router.post(
	'/attributes',
	authorization([RoleManager.manager, RoleManager.staff]),
	variantsManagers.attributeController.createAttributes,
); // Thêm thuộc tính cho biến thể sản phẩm
router.put(
	'/attributes/:id',
	authorization([RoleManager.manager, RoleManager.staff]),
	variantsManagers.attributeController.updateAttribute,
); // Thay đổi thuộc tính cho biến thể sản phẩm
router.delete(
	'/attributes/:id',
	authorization([RoleManager.manager, RoleManager.staff]),
	variantsManagers.attributeController.deleteAttribute,
); // Xóa thuộc tính cho biến thể sản phẩm

export default router;
