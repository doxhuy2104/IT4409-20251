import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import cors from 'cors';
import env from '../../env';
import { handleError } from '../exception/error.exception';
import { router as apiRoute } from '../routes';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { initPassport } from './passport.loader';

export default (app: express.Application) => {
	// Cấu hình CORS
	const corsOptions = {
		origin: (
			requestOrigin: string | undefined,
			callback: (err: Error | null, allow?: boolean) => void,
		) => {
			if (env.app.isProduction) {
				if (!requestOrigin || env.app.cors.includes(requestOrigin)) {
					callback(null, true);
				} else {
					callback(new Error('Not allowed by CORS'));
				}
			} else {
				callback(null, true);
			}
		},
		methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
		allowedHeaders:
			'Content-Type,Origin,X-Requested-With,Accept,Authorization,access-token,X-Access-Token',
		credentials: true,
		preflightContinue: false,
		optionsSuccessStatus: 200,
	};

	app.use(cors(corsOptions));

	app.use(
		morgan('dev', {
			skip: (req, res) => {
				return res.statusCode < 400;
			},
			stream: process.stderr,
		}),
	);

	app.use(
		morgan('dev', {
			skip: (req, res) => {
				return res.statusCode >= 400;
			},
			stream: process.stdout,
		}),
	);

	const staticOptions = {
		setHeaders: (res: Response) => {
			res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
		},
	};

	app.use(
		helmet(),
		express.json({ limit: '5mb' }),
		express.urlencoded({ extended: true }),
		// express.static(path.join(process.cwd(), 'uploads'), staticOptions),
	);

	app.use(
		'/uploads',
		express.static(path.join(process.cwd(), 'uploads'), staticOptions),
	);
	app.use(cookieParser());

	initPassport();
	app.use(passport.initialize());

	app.use('/api', apiRoute);

	app.all('*', (req: Request, res: Response, next: NextFunction) => {
		res.status(400).send('not found');
	});

	app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
		handleError(err, req, res, next);
	});
};
