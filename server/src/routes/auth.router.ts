import { Router } from 'express';

import * as auth from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validate.middleware';
import {
    loginSchema,
	forgotPasswordSchema,
	registerSchema,
	resetPasswordSchema,
	verifySchema,
} from '../validators/auth.validator';

const router = Router();

//login
router.post('/customers/login', validateBody(loginSchema), auth.login);
router.post('/managers/login', validateBody(loginSchema), auth.login);

//register
router.post('/register', validateBody(registerSchema), auth.register);

//verify
router.get('/verify', auth.verify);

//refresh token
router.get('/customers/refresh-token', auth.refreshToken);
router.get('/managers/refresh-token', auth.refreshToken);

//logout
router.post('/customers/logout', auth.logout);
router.post('/managers/logout', auth.logout);

//forgot password
router.post(
	'/customers/forgot-password',
	validateBody(forgotPasswordSchema),
	auth.forgotPassword,
);
router.post(
	'/customers/reset-password',
	validateBody(resetPasswordSchema),
	auth.resetPassword,
);

// Google OAuth routes
router.get('/google', auth.googleLogin);
router.get('/google/callback', auth.googleCallback);

export default router;
