import { Router } from 'express';
import { isManager, verifyToken } from '../middlewares/authenticate.middleware';
import { authorization, RoleManager } from '../middlewares/manager.middleware';
import * as adminlog from '../controllers/managers/admin-log.controller';
import { getMe } from '../controllers/auth.controller';

const router = Router();

router.use(isManager);
router.use(verifyToken);

router.get('/me', getMe);
router.get(
	'/admin-log',
	authorization([RoleManager.super_admin]),
	adminlog.getAdminLogs,
);
router.delete(
	'/admin-log/:id',
	authorization([RoleManager.super_admin]),
	adminlog.deleteAdminLogs,
);

router.get(
  '/admin-log/:id',
  authorization([RoleManager.super_admin]),
  adminlog.getAdminLogDetail,
);


export default router;
