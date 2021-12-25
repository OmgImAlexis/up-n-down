import createRouter from 'express-promise-router';
import uuid from 'uuid';
import morgan from 'morgan';
import { router as frontend } from './frontend.js';
import { router as api } from './api.js';

// Create main router
const router = createRouter();

// Add x-request-id header to all requests
router.use((req, res, next) => {
    const requestId = uuid.v4();
    req.id = requestId;
    req.headers['X-Request-Id'] = requestId;
    res.setHeader('X-Request-Id', requestId);
    next();
});

router.use(morgan('tiny'));
router.use('/', frontend);
router.use('/api', api);

export {
    router
};
