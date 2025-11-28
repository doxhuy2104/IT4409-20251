import { NextFunction, Request, Response } from 'express';
import {
	CONFLICT_ERROR,
	PERMISSION_ERROR,
	RESPONSE_SUCCESS,
} from '../constants/error.constant';
import * as authService from '../services/auth.service';
import { AppError } from '../../utility/app.error.util';
import env from '../../env';
import { ResOk } from '../../utility/response.util';
import { TimeUtil } from '../../utility/time.util';
import passport from 'passport';

export const login = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const isAdmin = req.path.includes('/managers');
		const path = isAdmin
			? '/api/auth/managers/refresh-token'
			: '/api/auth/customers/refresh-token';
		const user = await authService.authenticate(
			req.body.email,
			req.body.password,
			isAdmin,
		);
		if (user == null) {
			throw new AppError(CONFLICT_ERROR, 'Email or password is not match!');
		}

		const accessToken = authService.getAccessToken(
			user,
			env.app.jwtExpiredIn,
			isAdmin,
		);
		const refreshToken = authService.getRefreshToken(user, isAdmin);
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'none',
			maxAge: TimeUtil.parseTimeToMs(env.app.refreshTokenExpiry),
			path,
		});

		return res.status(RESPONSE_SUCCESS).json(
			new ResOk().formatResponse(
				{
					accessToken,
				},
				'access_token',
				RESPONSE_SUCCESS,
			),
		);
	} catch (e) {
		next(e);
	}
};

export const refreshToken = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const oldRefreshToken = req.cookies?.refreshToken;

		if (!oldRefreshToken) {
			throw new AppError(PERMISSION_ERROR, 'Refresh token not found');
		}
		const isAdmin = req.path.includes('/managers');
		const path = isAdmin
			? '/api/auth/managers/refresh-token'
			: '/api/auth/customers/refresh-token';

		try {
			const { accessToken, refreshToken } =
				await authService.refreshAccessToken(oldRefreshToken, isAdmin);
			res.cookie('refreshToken', refreshToken, {
				httpOnly: true,
				secure: true,
				sameSite: 'none',
				maxAge: TimeUtil.parseTimeToMs(env.app.refreshTokenExpiry),
				path,
			});

			return res.status(RESPONSE_SUCCESS).json(
				new ResOk().formatResponse(
					{
						accessToken,
					},
					'access_token',
					RESPONSE_SUCCESS,
				),
			);
		} catch (error) {
			console.error('Error refreshing token:', error);
			throw new AppError(PERMISSION_ERROR, 'Invalid refresh token');
		}
	} catch (e) {
		next(e);
	}
};

export const register = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		await authService.register(req.body);
		return res
			.status(RESPONSE_SUCCESS)
			.json(
				new ResOk().formatResponse(
					null,
					'User registered successfully',
					RESPONSE_SUCCESS,
				),
			);
	} catch (e) {
		next(e);
	}
};

export const verify = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { token, email } = req.query as any;

		if (!token || !email) {
			return res.send(`
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                    <title>Xác minh thất bại</title>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
                    <style>
                        body {
                            font-family: 'Roboto', sans-serif;
                            text-align: center;
                            background-color: #f8f9fa;
                            margin: 0;
                            padding: 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                            color: #333;
                        }
                        .container {
                            max-width: 500px;
                            margin: 0 auto;
                            padding: 40px;
                            background-color: white;
                            border-radius: 10px;
                            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                        }
                        .icon {
                            font-size: 64px;
                            margin-bottom: 20px;
                        }
                        .error {
                            color: #e74c3c;
                            font-size: 28px;
                            font-weight: 500;
                            margin-bottom: 20px;
                        }
                        .message {
                            margin-bottom: 30px;
                            font-size: 16px;
                            line-height: 1.5;
                            color: #555;
                        }
                        .btn {
                            background-color: #3498db;
                            color: white;
                            padding: 12px 24px;
                            text-decoration: none;
                            border-radius: 6px;
                            font-weight: 500;
                            font-size: 16px;
                            transition: all 0.3s ease;
                            display: inline-block;
                        }
                        .btn:hover {
                            background-color: #2980b9;
                            transform: translateY(-2px);
                            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="icon">❌</div>
                        <div class="error">Xác minh thất bại</div>
                        <div class="message">Thiếu thông tin cần thiết để xác minh tài khoản của bạn.</div>
                        <a href="${env.app.client_url}" class="btn">Quay lại trang chủ</a>
                    </div>
                </body>
                </html>
            `);
		}

		// Gọi service để xác minh
		const user = await authService.verify(token, email);

		if (user) {
			// Nếu xác minh thành công, thiết lập header redirect
			res.setHeader('Refresh', '3; url=' + env.app.client_url + '/login');

			return res.send(`
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                    <title>Xác minh thành công</title>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
                    <style>
                        body {
                            font-family: 'Roboto', sans-serif;
                            text-align: center;
                            background-color: #f8f9fa;
                            margin: 0;
                            padding: 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                            color: #333;
                        }
                        .container {
                            max-width: 500px;
                            margin: 0 auto;
                            padding: 40px;
                            background-color: white;
                            border-radius: 10px;
                            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                        }
                        .icon {
                            font-size: 64px;
                            margin-bottom: 20px;
                        }
                        .success {
                            color: #2ecc71;
                            font-size: 28px;
                            font-weight: 500;
                            margin-bottom: 20px;
                        }
                        .message {
                            margin-bottom: 10px;
                            font-size: 16px;
                            line-height: 1.5;
                            color: #555;
                        }
                        .redirect {
                            margin-bottom: 30px;
                            font-size: 15px;
                            color: #777;
                            font-style: italic;
                        }
                        .btn {
                            background-color: #2ecc71;
                            color: white;
                            padding: 12px 24px;
                            text-decoration: none;
                            border-radius: 6px;
                            font-weight: 500;
                            font-size: 16px;
                            transition: all 0.3s ease;
                            display: inline-block;
                        }
                        .btn:hover {
                            background-color: #27ae60;
                            transform: translateY(-2px);
                            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                        }
                        .loader {
                            display: inline-block;
                            width: 20px;
                            height: 20px;
                            margin-right: 10px;
                            border: 3px solid rgba(255,255,255,.3);
                            border-radius: 50%;
                            border-top-color: white;
                            animation: spin 1s linear infinite;
                            vertical-align: middle;
                        }
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="icon">✅</div>
                        <div class="success">Xác minh thành công</div>
                        <div class="message">Tài khoản của bạn đã được xác minh thành công.</div>
                        <div class="redirect"><span class="loader"></span>Đang chuyển hướng đến trang đăng nhập trong 3 giây...</div>
                        <a href="${env.app.client_url}/login" class="btn">Đăng nhập ngay</a>
                    </div>
                </body>
                </html>
            `);
		} else {
			// Nếu xác minh thất bại
			return res.send(`
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                    <title>Xác minh thất bại</title>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
                    <style>
                        body {
                            font-family: 'Roboto', sans-serif;
                            text-align: center;
                            background-color: #f8f9fa;
                            margin: 0;
                            padding: 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                            color: #333;
                        }
                        .container {
                            max-width: 500px;
                            margin: 0 auto;
                            padding: 40px;
                            background-color: white;
                            border-radius: 10px;
                            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                        }
                        .icon {
                            font-size: 64px;
                            margin-bottom: 20px;
                        }
                        .error {
                            color: #e74c3c;
                            font-size: 28px;
                            font-weight: 500;
                            margin-bottom: 20px;
                        }
                        .message {
                            margin-bottom: 30px;
                            font-size: 16px;
                            line-height: 1.5;
                            color: #555;
                        }
                        .btn {
                            background-color: #3498db;
                            color: white;
                            padding: 12px 24px;
                            text-decoration: none;
                            border-radius: 6px;
                            font-weight: 500;
                            font-size: 16px;
                            transition: all 0.3s ease;
                            display: inline-block;
                        }
                        .btn:hover {
                            background-color: #2980b9;
                            transform: translateY(-2px);
                            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="icon">❌</div>
                        <div class="error">Xác minh thất bại</div>
                        <div class="message">Liên kết xác minh không hợp lệ hoặc đã hết hạn.</div>
                        <a href="${env.app.client_url}/resend-verification" class="btn">Gửi lại email xác minh</a>
                    </div>
                </body>
                </html>
            `);
		}
	} catch (e) {
		// Nếu có lỗi trong quá trình xác minh
		res.send(`
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <title>Xác minh thất bại</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
                <style>
                    body {
                        font-family: 'Roboto', sans-serif;
                        text-align: center;
                        background-color: #f8f9fa;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        color: #333;
                    }
                    .container {
                        max-width: 500px;
                        margin: 0 auto;
                        padding: 40px;
                        background-color: white;
                        border-radius: 10px;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    }
                    .icon {
                        font-size: 64px;
                        margin-bottom: 20px;
                    }
                    .error {
                        color: #e74c3c;
                        font-size: 28px;
                        font-weight: 500;
                        margin-bottom: 20px;
                    }
                    .message {
                        margin-bottom: 30px;
                        font-size: 16px;
                        line-height: 1.5;
                        color: #555;
                    }
                    .btn {
                        background-color: #3498db;
                        color: white;
                        padding: 12px 24px;
                        text-decoration: none;
                        border-radius: 6px;
                        font-weight: 500;
                        font-size: 16px;
                        transition: all 0.3s ease;
                        display: inline-block;
                    }
                    .btn:hover {
                        background-color: #2980b9;
                        transform: translateY(-2px);
                        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="icon">❌</div>
                    <div class="error">Xác minh thất bại</div>
                    <div class="message">Đã xảy ra lỗi trong quá trình xác minh tài khoản.</div>
                    <a href="${env.app.client_url}" class="btn">Quay lại trang chủ</a>
                </div>
            </body>
            </html>
        `);
		next(e);
	}
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
	try {
		const isAdmin = req.path.includes('/managers');
		const path = isAdmin
			? '/api/auth/managers/refresh-token'
			: '/api/auth/customers/refresh-token';
		res.clearCookie('refreshToken', {
			path,
		});

		return res
			.status(RESPONSE_SUCCESS)
			.json(
				new ResOk().formatResponse(
					null,
					'Đăng xuất thành công',
					RESPONSE_SUCCESS,
				),
			);
	} catch (e) {
		next(e);
	}
};

export const forgotPassword = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { email } = req.body;
		await authService.forgotPassword(email);

		return res
			.status(RESPONSE_SUCCESS)
			.json(
				new ResOk().formatResponse(
					null,
					'Email đặt lại mật khẩu đã được gửi',
					RESPONSE_SUCCESS,
				),
			);
	} catch (e) {
		next(e);
	}
};

export const resetPassword = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const { token, email, newPassword } = req.body;

		await authService.resetPassword(token, email, newPassword);

		return res
			.status(RESPONSE_SUCCESS)
			.json(
				new ResOk().formatResponse(
					null,
					'Mật khẩu đã được đặt lại thành công',
					RESPONSE_SUCCESS,
				),
			);
	} catch (e) {
		next(e);
	}
};

export const googleLogin = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		passport.authenticate('google', {
			scope: ['profile', 'email'],
		})(req, res, next);
	} catch (e) {
		next(e);
	}
};

export const googleCallback = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		passport.authenticate(
			'google',
			{ session: false },
			async (err: Error, user: any) => {
				if (err) {
					return next(err);
				}

				if (!user) {
					return res.redirect(
						`${env.app.client_url}/login?error=auth_failed`,
					);
				}

				const accessToken = authService.getAccessToken(
					user,
					env.app.jwtExpiredIn,
					false,
				);
				const refreshToken = authService.getRefreshToken(user, false);
				const path = '/api/auth/customers/refresh-token';

				res.cookie('refreshToken', refreshToken, {
					httpOnly: true,
					secure: true,
					sameSite: 'none',
					maxAge: TimeUtil.parseTimeToMs(env.app.refreshTokenExpiry),
					path,
				});

				return res.redirect(
					`${env.app.client_url}/login/success?accessToken=${accessToken}`,
				);
			},
		)(req, res, next);
	} catch (e) {
		next(e);
	}
};

export const getMe = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const isAdmin = (req as any).isAdmin;
		const id = (req as any).user.id;
		const user = await authService.getMe(id, isAdmin);
		return res
			.status(RESPONSE_SUCCESS)
			.json(
				new ResOk().formatResponse(
					user,
					'User information',
					RESPONSE_SUCCESS,
				),
			);
	} catch (error) {
		next(error);
	}
};
