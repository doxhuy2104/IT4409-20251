import express from 'express';
import * as dashboard from '../controllers/managers/dashboard.controller';
import { isManager, verifyToken } from '../middlewares/authenticate.middleware';

const router = express.Router();


router.get('/', isManager, verifyToken, dashboard.getAllDashboard);

export default router;
