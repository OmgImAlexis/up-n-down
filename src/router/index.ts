import createRouter from 'express-promise-router';
import { router as frontend } from './frontend.js';
import { router as api } from './api.js';

// Create main router
export const router = createRouter();

// Routes
router.use('/api', api);
router.use('/', frontend);
