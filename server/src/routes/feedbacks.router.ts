import express from 'express';
import * as feedbackController from '../controllers/managers/feedbacks.controller';
import { isManager, verifyToken } from '../middleware/authenticate.middleware';
import { authorization, RoleManager } from '../middleware/manager.middleware';

const router = express.Router();

// Customer đăng phản hồi
router.post('/', verifyToken, feedbackController.createfeedback);

// Manager xem và xóa phản hồi
router.get(
	'/',
	isManager,
	verifyToken,
	authorization([RoleManager.manager, RoleManager.staff]),
	feedbackController.getAllfeedbacks,
);
router.delete(
	'/:id',
	isManager,
	verifyToken,
	authorization([RoleManager.manager, RoleManager.staff]),
	feedbackController.deletefeedback,
);

export default router;
