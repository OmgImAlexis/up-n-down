import createRouter from 'express-promise-router';
import { serializeError } from 'serialize-error';
import { body as validateBody } from 'express-validator';
import { home } from '../routes/home.js';
import { getSettings } from '../routes/settings/get.js';
import { postSettings } from '../routes/settings/post.js';
import { getSettingsUsername } from '../routes/settings/username/get.js';
import { postSettingsUsername } from '../routes/settings/username/post.js';
import { renderPage } from '../common/utils/render-page.js';
import { getLogin, postLogin } from '../routes/auth/login.js';
import { getSignup, postSignup } from '../routes/auth/sign-up.js';
import { getNew } from '../routes/new/get.js';
import { postNew } from '../routes/new/post.js';
import { getPost } from '../routes/post/get.js';
import { getFollowing } from '../routes/following/get.js';
import { postFollowing } from '../routes/following/post.js';
import { postPost } from '../routes/post/post.js';
import { getPostEdit } from '../routes/post/edit/get.js';
import { postPostEdit } from '../routes/post/edit/post.js';
import { getInbox } from '../routes/inbox/get.js';
import { getComment } from '../routes/comment/get.js';
import { postComment } from '../routes/comment/post.js';
import { getCommentEdit } from '../routes/comment/edit/get.js';
import { postCommentEdit } from '../routes/comment/edit/post.js';
import { getLeaving } from '../routes/leaving/get.js';
import { getGroups } from '../routes/groups/get.js';
import { getSettingsGroups } from '../routes/settings/groups/get.js';
import { postSettingsGroups } from '../routes/settings/groups/post.js';
import { getSettingsGroup } from '../routes/settings/group/get.js';
import { getUser } from '../routes/user/get.js';
import createHttpError from 'http-errors';
import { getCurrentSiteMaxWidth } from '../common/settings/get-current-site-max-width.js';
import { site } from '../config/index.js';
import { compileMarkdown } from '../common/compile-markdown.js';
// Import { postSettingsGroup } from '../routes/settings/group/post.js';

const { NotFound } = createHttpError;

// Create main router
const router = createRouter();

// Add user to locals
router.use((req, res, next) => {
	res.locals.user = req.session.user;
	next();
});

// Add markdown parser to locals
router.use((req, res, next) => {
	res.locals.compileMarkdown = compileMarkdown;
	next();
});

// Add site details to locals
router.use((req, res, next) => {
	res.locals.site = {
		...site,
		maxWidth: getCurrentSiteMaxWidth(req),
	};
	next();
});

// Static routes
router.route('/manual').get(renderPage('static/manual', { html: { title: 'Manual' } }));
router.route('/privacy-policy').get(renderPage('static/privacy-policy', { html: { title: 'Privacy Policy' } }));
router.route('/contact-us').get(renderPage('static/contact-us', { html: { title: 'Contact Us' } }));
router.route('/api').get(renderPage('static/api', { html: { title: 'API' } }));

// Logout page
router.get('/logout', (req, res) => {
	req.session.destroy();
	res.redirect('/');
});

// Validation middleware
const usernameMiddleware = validateBody('username', 'Username must be 4-16 characters (letters, numbers and dashes only)').notEmpty().withMessage('Please fill in a username').matches(/^[a-z0-9-]{4,16}$/i);
const passwordMiddleware = validateBody('password', 'Password must be 9-100 characters').notEmpty().withMessage('Please fill in a password').matches(/^.{9,100}$/);
const mustBeAuthenticatedMiddleware = (req, res, next) => {
	if (!req.session.user) {
		res.redirect('/sign-up');
	}

	next();
};

// eslint-disable-next-line camelcase
const editPostLinkMiddleware = validateBody('link', 'link must be an http or https URL').optional().isURL({ protocols: ['http', 'https'], require_protocol: true });
const editPostTextContentMiddleware = validateBody('text_content', 'Please write some content').optional();

// Homepage
router.get('/', home);

// Settings
router.get('/settings', getSettings);
router.post('/settings', postSettings);
router.get('/settings/username', getSettingsUsername);
router.post('/settings/username', mustBeAuthenticatedMiddleware, postSettingsUsername);
router.get('/settings/groups', mustBeAuthenticatedMiddleware, getSettingsGroups);
router.post('/settings/groups', mustBeAuthenticatedMiddleware, postSettingsGroups);
router.get('/settings/group', mustBeAuthenticatedMiddleware, getSettingsGroup);
// Router.post('/settings/group', mustBeAuthenticatedMiddleware, postSettingsGroup);

// Auth
router.get('/sign-up', getSignup);
router.post('/sign-up', usernameMiddleware, passwordMiddleware, postSignup);
router.get('/login', getLogin);
router.post('/login', postLogin);

// Posts
router.get('/new', mustBeAuthenticatedMiddleware, getNew);
router.post('/new', mustBeAuthenticatedMiddleware, postNew);
router.get('/p/:postId', getPost);
router.post('/p/:postId', postPost);
router.get('/p/:postId/edit', mustBeAuthenticatedMiddleware, getPostEdit);
router.post('/p/:postId/edit', mustBeAuthenticatedMiddleware, editPostLinkMiddleware, editPostTextContentMiddleware, postPostEdit);

// Comments
router.get('/c/:commentId', getComment);
router.post('/c/:commentId', postComment);
router.get('/c/:commentId/edit', mustBeAuthenticatedMiddleware, getCommentEdit);
router.post('/c/:commentId/edit', mustBeAuthenticatedMiddleware, postCommentEdit);

// Users
router.get('/u/:username', getUser);

// Following
router.get('/following', mustBeAuthenticatedMiddleware, getFollowing);
router.post('/following', mustBeAuthenticatedMiddleware, postFollowing);

// Groups
router.get('/g/:groupId', getGroups);

// Inbox
router.get('/inbox', mustBeAuthenticatedMiddleware, getInbox);

// Leaving
router.get('/leaving', getLeaving);

const createErrorHandlerMiddleware = error => (req, res) => {
	const httpError = createHttpError(error);
	const { status } = httpError;

	// Set status
	res.status(status);

	// Respond with HTML
	if (req.accepts('html')) {
		return res.render(status === 404 ? 'http/not-found' : 'http/error', {
			html: {
				title: httpError.message,
			},
			error: httpError,
		});
	}

	const { message, stack } = serializeError(httpError);

	// Respond with JSON
	if (req.accepts('json')) {
		return res.json({
			status,
			error: {
				message,
				...(process.env.NODE_ENV === 'production' ? {} : { stack }),
			},
		});
	}

	// Default to plain-text
	res.type('txt').send(message);
};

// 404
router.use(createErrorHandlerMiddleware(new NotFound()));

// 5XX
router.use((error, req, res, _next) => createErrorHandlerMiddleware(error)(req, res));

export {
	router,
};
