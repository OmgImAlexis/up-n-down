import createRouter from 'express-promise-router';
import { postComment } from '../routes/api/comment/post.js';

// Create main router
const router = createRouter();

router.post('/v1/comment', postComment);

export {
    router
};
