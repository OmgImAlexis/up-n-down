import { join as joinPath } from 'path';
import express, { static as createStaticMiddleware, urlencoded, json } from 'express';
import cookieParser from 'cookie-parser';
import { v4 } from 'uuid';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { createClient } from 'redis';
import { config } from 'dotenv';
import { randomBytes } from 'crypto';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { importJson } from './common/utils/import-json.js';
import { router } from './router/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const RedisStore = connectRedis(session);

// Import package.json name field
const { name } = importJson(joinPath(__dirname, '../package.json'));

// Load .env into process.env
config();

const createSessionMiddleware = client => session({
	genid: () => v4(),
	name: process.env.SESSION_NAME ?? `${name}-session`,
	secret: process.env.SESSION_SECRET ?? randomBytes(64).toString(),
	resave: false,
	saveUninitialized: false,
	store: new RedisStore({ client }),
	cookie: {
		httpOnly: true,
		path: '/',
		secure: process.env.NODE_ENV === 'production',
	},
});

const publicAssetsPath = joinPath(__dirname, '../public');

const main = async () => {
	// Create redis client
	const redisClient = createClient({
		legacyMode: true,
	});

	// Wait for redis to connect
	await redisClient.connect();

	// Create main express app
	const app = express();

	// Setup body parsing
	app.use(urlencoded({ extended: false }));
	app.use(json());

	// Setup page rendering
	app.set('view engine', 'pug');
	app.set('views', joinPath(__dirname, 'views'));

	// Setup session
	app.use(createSessionMiddleware(redisClient));

	// Setup cookies
	app.use(cookieParser());

	// Setup asset directory
	app.use(createStaticMiddleware(publicAssetsPath));

	// Setup routes
	app.use(router);

	// Start web server
	const server = app.listen(process.env.HTTP_PORT ?? 0, () => {
		const address = server.address();
		console.info(`${name} is listening at ${typeof address === 'string' ? address : `http://localhost:${address.port}`}`);
	});
};

// Start app
main().catch(error => {
	console.error('Failed starting app with "%s', error.message);
});
