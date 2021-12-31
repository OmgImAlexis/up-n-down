import type Express from 'express';
import createRouter from 'express-promise-router';
import { getPosts } from '../routes/api/posts/get.js';
import { getPost } from '../routes/api/post/get.js';
import { getComment } from '../routes/api/comment/get.js';
import { postComment } from '../routes/api/comment/post.js';
import { serializeError } from 'serialize-error';
import createHttpError from 'http-errors';
import { firehose } from '../common/firehose.js';
import { deleteNotification } from '../routes/api/notification/delete.js';

const { NotFound } = createHttpError;

// Create main router
const router = createRouter();

// Posts
router.get('/v1/post', getPosts);
router.get('/v1/post/:postId', getPost);

// Comments
router.get('/v1/comment/:commentId', getComment);
router.post('/v1/comment', postComment);

// Firehose
router.get('/v1/firehose', firehose);
router.delete('/v1/notification/:id', deleteNotification);

const createErrorHandlerMiddleware = (error: Error) => (_request: Express.Request, response: Express.Response) => {
	const httpError = createHttpError(error);
	const { status } = httpError;

	// Set status
	response.status(status);

	const { message, stack } = serializeError(httpError);

	// Respond with JSON
	return response.json({
		status,
		error: {
			message,
			...(process.env.NODE_ENV === 'production' ? {} : { stack }),
		},
	});
};

// 404
router.use(createErrorHandlerMiddleware(new NotFound()));

// 5XX
router.use((error: Error, request: Express.Request, response: Express.Response, _next: Express.NextFunction) => createErrorHandlerMiddleware(error)(request, response));

export {
	router,
};
