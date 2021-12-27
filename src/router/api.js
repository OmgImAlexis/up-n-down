import createRouter from 'express-promise-router';
import { getComment } from '../routes/api/comment/get.js';
import { postComment } from '../routes/api/comment/post.js';
import { serializeError } from 'serialize-error';
import createHttpError from 'http-errors';
import { firehose } from '../common/firehouse.js';
import { deleteNotification } from '../routes/api/notification/delete.js';

const { NotFound } = createHttpError;

// Create main router
const router = createRouter();

// Comments
router.get('/v1/comment/:commentId', getComment);
router.post('/v1/comment', postComment);

// Firehose
router.get('/v1/firehose', firehose);
router.delete('/v1/notification/:id', deleteNotification);

const createErrorHandlerMiddleware = error => (req, res) => {
	const httpError = createHttpError(error);
	const { status } = httpError;

	// Set status
	res.status(status);

	const { message, stack } = serializeError(httpError);

	// Respond with JSON
	return res.json({
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
router.use((error, req, res, _next) => createErrorHandlerMiddleware(error)(req, res));

export {
	router,
};
