import createRouter from 'express-promise-router';
import { getComment } from '../routes/api/comment/get.js';
import { postComment } from '../routes/api/comment/post.js';
import { serializeError } from 'serialize-error';
import createHttpError from 'http-errors';

const { NotFound } = createHttpError;

// Create main router
const router = createRouter();

router.get('/v1/comment/:commentId', getComment);
router.post('/v1/comment', postComment);

const createErrorHandlerMiddleware = (error) => (req, res) => {
    const httpError = createHttpError(error);
    const status = httpError.status;
    
    // Set status
    res.status(status);

    const { message, stack } = serializeError(httpError);

    // Respond with JSON
    return res.json({
        status,
        error: {
            message,
            ...(process.env.NODE_ENV === 'production' ? {} : { stack })
        }
    });
};

// 404
router.use(createErrorHandlerMiddleware(new NotFound()));

// 5XX
router.use((error, req, res, next) => createErrorHandlerMiddleware(error)(req, res));

export {
    router
};
