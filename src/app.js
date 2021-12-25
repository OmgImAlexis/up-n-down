import { join as joinPath } from 'path';
import { serializeError } from 'serialize-error';
import express, { static as createStaticMiddleware, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import uuid from 'uuid';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { createClient } from 'redis';
import { config } from 'dotenv';
import { randomBytes } from 'crypto';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { importJson } from './common/import-json.js';
import { getCurrentSiteMaxWidth } from './common/get-current-site-max-width.js';
import { router } from './router.js';

class HttpError extends Error {
    constructor(message, status = 500, cause) {
        super(message);
        this.status = status;
        this.code = `HTTP_${status}`;
        this.cause = cause;
    }
}

const __dirname = dirname(fileURLToPath(import.meta.url));

const redisStore = connectRedis(session);

// Import package.json name field
const name = importJson(joinPath(__dirname, '../package.json')).name;

// Load .env into process.env
config();

const createSessionMiddleware = client => session({
    genid: () => uuid.v4(),
    name: process.env.SESSION_NAME ?? `${name}-session`,
    secret: process.env.SESSION_SECRET ?? randomBytes(64).toString(),
    resave: false,
    saveUninitialized: false,
    store: new redisStore({ client })
});

const createErrorHandlerMiddleware = (error) => (req, res) => {
    const status = error.status;
    
    // Set status
    res.status(status);

    // Respond with HTML
    if (req.accepts('html')) return res.render(`http/${status}`, { html: { title: error.cause ? error.cause.message : error.message }, error });

    // Respond with JSON
    if (req.accepts('json')) return res.json(serializeError(error));

    // Default to plain-text
    res.type('txt').send(message);
};

const main = async () => {
    // Create redis client
    const redisClient = createClient(process.env.REDIS_PORT ?? '6379', process.env.REDIS_HOST ?? 'localhost');

    // Create main express app
    const app = express();

    // Setup page rendering
    app.set('view engine', 'pug')
    app.set('views', joinPath(__dirname, 'views'));

    // Setup session
    app.use(createSessionMiddleware(redisClient));

    // Add user to locals
    app.use(function(req,res,next){
        res.locals.user = req.session.user;
        next();
    });

    // Setup asset directory
    app.use(createStaticMiddleware(joinPath(__dirname, '../public')));

    // Setup other misc middleware
    app.use(urlencoded({ extended:false }));
    app.use(cookieParser());

    // Add site max width to locals
    app.use((req, res, next) => {
        res.locals.site = {
            maxWidth: getCurrentSiteMaxWidth(req)
        };
        next();
    });

    // Setup routes
    app.use(router);

    // 404
    app.use(createErrorHandlerMiddleware(new HttpError('Not Found', 404)));

    // 5XX
    app.use((error, req, res, next) => createErrorHandlerMiddleware(new HttpError('Internal Server Error', 500, error))(req, res));

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
