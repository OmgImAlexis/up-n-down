import createRouter from 'express-promise-router';
import { router as frontend } from './frontend.js';
import { router as api } from './api.js';

// Create main router
const router = createRouter();

router.use('/', frontend);
router.use('/api', api);

export {
    router
};
