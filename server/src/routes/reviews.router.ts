import express from 'express';
import * as reviewService from '../controllers/customers/reviews.controller';
import { isManager, verifyToken } from '../middleware/authenticate.middleware';
import { authorization, RoleManager } from '../middleware/manager.middleware';

const router = express.Router();

//Public
router.get('/', reviewService.getAllReviews);
router.get('/:id', reviewService.getReviewsByProduct);

//Customer
router.post('/', verifyToken, reviewService.createReview);
router.put('/:id', verifyToken, reviewService.updateReview);

//Manager
router.delete(
	'/:id',
	isManager,
	verifyToken,
	authorization([RoleManager.manager, RoleManager.staff]),
	reviewService.deleteReview,
);

router.delete('/customer/:id', verifyToken, reviewService.deleteReview);

router.put(
	'/approve/:id',
	isManager,
	verifyToken,
	authorization([RoleManager.manager, RoleManager.staff]),
	reviewService.approveReview,
);

export default router;
