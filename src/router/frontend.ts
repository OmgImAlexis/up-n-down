import createRouter from 'express-promise-router';
import rateLimit from 'express-rate-limit';
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
import { site, postsPerPage, commentsPerPage } from '../config.js';
import { compileMarkdown } from '../common/compile-markdown.js';
import { Request, Response, NextFunction } from 'express';
// Import { postSettingsGroup } from '../routes/settings/group/post.js';

const { NotFound, TooManyRequests } = createHttpError;

// Create main router
const router = createRouter();

// Add items to locals
router.use((request, response, next) => {
	// Add user
	response.locals.user = request.session.user;

	// Add markdown parser
	response.locals.compileMarkdown = compileMarkdown;

	// Add site details
	response.locals.site = {
		...site,
		maxWidth: getCurrentSiteMaxWidth(request),
		postsPerPage,
		commentsPerPage,
	};

	next();
});

// Rate limiting
router.use(rateLimit({
	windowMs: 60 * 1_000, // 60 seconds
	onLimitReached() {},
	max: 1_000, // Limit each IP to 1k requests per `window` (here, per 1 minute)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	handler() {
		throw new TooManyRequests('Too many requests, please try again in a few minutes.');
	},
}));

// Static routes
router.get('/privacy-policy', renderPage('static/privacy-policy', { html: { title: 'Privacy Policy' } }));
router.get('/contact-us', renderPage('static/contact-us', { html: { title: 'Contact Us' } }));
router.get('/docs/site', renderPage('static/docs/site', { html: { title: 'Site Documentation' } }));
router.get('/docs/api', renderPage('static/docs/api', { html: { title: 'API Documentation' } }));

// Debug page
router.get('/debug', renderPage('debug', { html: { title: 'Debug' } }));

// Logout page
router.get('/logout', (request: Request, response: Response) => {
	request.session.destroy(() => {
		response.redirect('/');
	});
});

// Validation middleware
const usernameMiddleware = validateBody('username', 'Username must be 4-16 characters (letters, numbers and dashes only)').notEmpty().withMessage('Please fill in a username').matches(/^[a-z0-9-]{4,16}$/i);
const passwordMiddleware = validateBody('password', 'Password must be 9-100 characters').notEmpty().withMessage('Please fill in a password').matches(/^.{9,100}$/);
const mustBeAuthenticatedMiddleware = (request: Request, response: Response, next: NextFunction) => {
	if (!request.session.user) {
		response.redirect('/sign-up');
	}

	next();
};

const editPostLinkMiddleware = validateBody('link', 'link must be an http or https URL').optional({ checkFalsy: true }).isURL({ protocols: ['http', 'https'], require_protocol: true });
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

const createErrorHandlerMiddleware = (error: Error) => (request: Request, response: Response) => {
	try {
		const httpError = createHttpError(error);
		const { status } = httpError;

		// Set status
		response.status(status);

		// Respond with HTML
		if (request.accepts('html')) {
			return response.render(status === 404 ? 'http/not-found' : 'http/error', {
				html: {
					title: httpError.message,
				},
				error: httpError,
				HttpError: createHttpError,
			}, error => {
				throw error;
			});
		}

		const { message, stack } = serializeError(httpError);

		// Respond with JSON
		if (request.accepts('json')) {
			return response.json({
				status,
				error: {
					message,
					...(process.env.NODE_ENV === 'production' ? {} : { stack }),
				},
			});
		}

		// Default to plain-text
		response.type('txt').send(message);
	} catch {
		// Set status
		response.status(500);

		// Respond with HTML
		if (request.accepts('html')) {
			const code = 500;
			const message = 'Internal Server Error';
			// Source https://github.com/tarampampam/error-pages
			return response.send(`
				<!DOCTYPE html>
				<html lang="en">
				<head>
					<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
					<meta name="robots" content="noindex, nofollow" />
					<title>${code}: ${message}</title>
					<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
					<style>
						html,body {background-color:#1a1a1a;color:#fff;font-family:sans-serif}
						.wrap {top:50%;left:50%;width:310px;height:260px;margin-left:-155px;margin-top:-110px;position:absolute;text-align:center}
						.ghost {animation:float 3s ease-out infinite}
						@keyframes float { 50% {transform:translate(0,20px)}}
						.shadowFrame {width:130px;margin: 10px auto 0 auto}
						.shadow {animation:shrink 3s ease-out infinite;transform-origin:center center}
						@keyframes shrink {0%{width:90%;margin:0 5%} 50% {width:60%;margin:0 18%} 100% {width:90%;margin:0 5%}}
						h3 {font-size:1.05em;text-transform: uppercase;margin:0.3em auto}
						.description {font-size:0.8em;color:#aaa}
					</style>
				</head>
				<body>
				<div class="wrap">
					<svg class="ghost" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="127.433px" height="132.743px" viewBox="0 0 127.433 132.743" enable-background="new 0 0 127.433 132.743" xml:space="preserve">
					<path fill="#FFF6F4" d="M116.223,125.064c1.032-1.183,1.323-2.73,1.391-3.747V54.76c0,0-4.625-34.875-36.125-44.375 s-66,6.625-72.125,44l-0.781,63.219c0.062,4.197,1.105,6.177,1.808,7.006c1.94,1.811,5.408,3.465,10.099-0.6 c7.5-6.5,8.375-10,12.75-6.875s5.875,9.75,13.625,9.25s12.75-9,13.75-9.625s4.375-1.875,7,1.25s5.375,8.25,12.875,7.875 s12.625-8.375,12.625-8.375s2.25-3.875,7.25,0.375s7.625,9.75,14.375,8.125C114.739,126.01,115.412,125.902,116.223,125.064z"></path>
						<circle fill="#1a1a1a" cx="86.238" cy="57.885" r="6.667"></circle>
						<circle fill="#1a1a1a" cx="40.072" cy="57.885" r="6.667"></circle>
						<path fill="#1a1a1a" d="M71.916,62.782c0.05-1.108-0.809-2.046-1.917-2.095c-0.673-0.03-1.28,0.279-1.667,0.771 c-0.758,0.766-2.483,2.235-4.696,2.358c-1.696,0.094-3.438-0.625-5.191-2.137c-0.003-0.003-0.007-0.006-0.011-0.009l0.002,0.005 c-0.332-0.294-0.757-0.488-1.235-0.509c-1.108-0.049-2.046,0.809-2.095,1.917c-0.032,0.724,0.327,1.37,0.887,1.749 c-0.001,0-0.002-0.001-0.003-0.001c2.221,1.871,4.536,2.88,6.912,2.986c0.333,0.014,0.67,0.012,1.007-0.01 c3.163-0.191,5.572-1.942,6.888-3.166l0.452-0.453c0.021-0.019,0.04-0.041,0.06-0.061l0.034-0.034 c-0.007,0.007-0.015,0.014-0.021,0.02C71.666,63.771,71.892,63.307,71.916,62.782z"></path>
						<circle fill="#FCEFED" stroke="#FEEBE6" stroke-miterlimit="10" cx="18.614" cy="99.426" r="3.292"></circle>
						<circle fill="#FCEFED" stroke="#FEEBE6" stroke-miterlimit="10" cx="95.364" cy="28.676" r="3.291"></circle>
						<circle fill="#FCEFED" stroke="#FEEBE6" stroke-miterlimit="10" cx="24.739" cy="93.551" r="2.667"></circle>
						<circle fill="#FCEFED" stroke="#FEEBE6" stroke-miterlimit="10" cx="101.489" cy="33.051" r="2.666"></circle>
						<circle fill="#FCEFED" stroke="#FEEBE6" stroke-miterlimit="10" cx="18.738" cy="87.717" r="2.833"></circle>
						<path fill="#FCEFED" stroke="#FEEBE6" stroke-miterlimit="10" d="M116.279,55.814c-0.021-0.286-2.323-28.744-30.221-41.012 c-7.806-3.433-15.777-5.173-23.691-5.173c-16.889,0-30.283,7.783-37.187,15.067c-9.229,9.736-13.84,26.712-14.191,30.259 l-0.748,62.332c0.149,2.133,1.389,6.167,5.019,6.167c1.891,0,4.074-1.083,6.672-3.311c4.96-4.251,7.424-6.295,9.226-6.295 c1.339,0,2.712,1.213,5.102,3.762c4.121,4.396,7.461,6.355,10.833,6.355c2.713,0,5.311-1.296,7.942-3.962 c3.104-3.145,5.701-5.239,8.285-5.239c2.116,0,4.441,1.421,7.317,4.473c2.638,2.8,5.674,4.219,9.022,4.219 c4.835,0,8.991-2.959,11.27-5.728l0.086-0.104c1.809-2.2,3.237-3.938,5.312-3.938c2.208,0,5.271,1.942,9.359,5.936 c0.54,0.743,3.552,4.674,6.86,4.674c1.37,0,2.559-0.65,3.531-1.932l0.203-0.268L116.279,55.814z M114.281,121.405 c-0.526,0.599-1.096,0.891-1.734,0.891c-2.053,0-4.51-2.82-5.283-3.907l-0.116-0.136c-4.638-4.541-7.975-6.566-10.82-6.566 c-3.021,0-4.884,2.267-6.857,4.667l-0.086,0.104c-1.896,2.307-5.582,4.999-9.725,4.999c-2.775,0-5.322-1.208-7.567-3.59 c-3.325-3.528-6.03-5.102-8.772-5.102c-3.278,0-6.251,2.332-9.708,5.835c-2.236,2.265-4.368,3.366-6.518,3.366 c-2.772,0-5.664-1.765-9.374-5.723c-2.488-2.654-4.29-4.395-6.561-4.395c-2.515,0-5.045,2.077-10.527,6.777 c-2.727,2.337-4.426,2.828-5.37,2.828c-2.662,0-3.017-4.225-3.021-4.225l0.745-62.163c0.332-3.321,4.767-19.625,13.647-28.995 c3.893-4.106,10.387-8.632,18.602-11.504c-0.458,0.503-0.744,1.165-0.744,1.898c0,1.565,1.269,2.833,2.833,2.833 c1.564,0,2.833-1.269,2.833-2.833c0-1.355-0.954-2.485-2.226-2.764c4.419-1.285,9.269-2.074,14.437-2.074 c7.636,0,15.336,1.684,22.887,5.004c26.766,11.771,29.011,39.047,29.027,39.251V121.405z"></path>
					</svg>
					<p class="shadowFrame">
						<svg version="1.1" class="shadow" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="61px" y="20px" width="122.436px" height="39.744px" viewBox="0 0 122.436 39.744" enable-background="new 0 0 122.436 39.744" xml:space="preserve">
						<ellipse fill="#262626" cx="61.128" cy="19.872" rx="49.25" ry="8.916"></ellipse>
					</svg>
					</p>
					<h3>Error ${code}</h3>
					<p class="description">${message}</p>
				</div>
				</body>
				</html>
			`.split('\n').map(line => line.trim()).join(''))	
		}

		// Respond with JSON
		if (request.accepts('json')) {
			return response.json({
				status: 500,
				error: {
					message: 'Internal Server Error',
				},
			});
		}

		// Default to plain-text
		response.type('txt').send('Internal Server Error');
	}
};

// 404
router.use(createErrorHandlerMiddleware(new NotFound()));

// 5XX
router.use((error: Error, request: Request, response: Response, _next: NextFunction) => createErrorHandlerMiddleware(error)(request, response));

export {
	router,
};
