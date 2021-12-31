import { join as joinPath } from 'path';
import express, { static as createStaticMiddleware, urlencoded, json } from 'express';
import cookieParser from 'cookie-parser';
import { v4 } from 'uuid';
import session from 'express-session';
import createPostgresSession from 'connect-pg-simple';
import { config } from 'dotenv';
import { randomBytes } from 'crypto';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';
import { importJson } from './common/utils/import-json.js';
import { router } from './router/index.js';
import { web } from './config.js';
import { pool } from './db/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Import package.json name field
const { name } = importJson(joinPath(__dirname, '../package.json'));

// Load .env into process.env
config();

const PostgresSession = createPostgresSession(session);

const store = new PostgresSession({
	pool,
});

const createSessionMiddleware = () => session({
	genid: () => v4(),
	name: process.env.SESSION_NAME ?? `${name}-session`,
	secret: process.env.SESSION_SECRET ?? randomBytes(64).toString(),
	resave: false,
	saveUninitialized: false,
	store,
	cookie: {
		httpOnly: true,
		path: '/',
		secure: Boolean(process.env.COOKIE_SECURE),
	},
});

const publicAssetsPath = joinPath(__dirname, '../public');

const main = async () => {
	// Create main express app
	const app = express();

	// Disable x-powered-by header
	app.disable('x-powered-by');

	// Add x-request-id header to all requests
	app.use((req, res, next) => {
		const requestId = v4();
		req.id = requestId;
		req.headers['X-Request-Id'] = requestId;
		res.setHeader('X-Request-Id', requestId);
		next();
	});

	// Add route logging
	if (process.env.HTTP_LOGGING) {
		app.use(morgan('tiny'));
	}

	// Enable reverse proxy support
	if (process.env.TRUST_PROXY) {
		app.enable('trust proxy');
	}

	// Setup body parsing
	app.use(urlencoded({ extended: false }));
	app.use(json());

	// Setup page rendering
	app.set('view engine', 'pug');
	app.set('views', joinPath(__dirname, 'views'));

	// Setup session
	app.use(createSessionMiddleware());

	// Setup cookies
	app.use(cookieParser());

	// Setup asset directory
	app.use(createStaticMiddleware(publicAssetsPath));

	// Setup routes
	app.use(router);

	// Start web server
	const server = app.listen(web.port, () => {
		const address = server.address();
		console.info(`${name} is listening at ${typeof address === 'string' ? address : `http://localhost:${address.port}`}`);
	});
};

// Start app
main().catch(error => {
	console.log(error);
	console.error('Failed starting app with "%s', error.message);
});
