import express from 'express';
import * as adminAccount from '../controllers/managers/admin.controller';
import { isManager, verifyToken } from '../middlewares/authenticate.middleware';
import { authorization, RoleManager } from '../middlewares/manager.middleware';

const router = express.Router();
router.use(isManager);
router.use(verifyToken);

// Quản lý account của admin
router.get(
	'/admin/',
	authorization([RoleManager.super_admin]),
	adminAccount.getAdmin,
);
router.post(
	'/admin/',
	authorization([RoleManager.super_admin]),
	adminAccount.createAccount,
);
router.put(
	'/admin/:id',
	authorization([RoleManager.super_admin]),
	adminAccount.updateAccount,
);
router.delete(
	'/admin/:id',
	authorization([RoleManager.super_admin]),
	adminAccount.deleteAccount,
);

export default router;
