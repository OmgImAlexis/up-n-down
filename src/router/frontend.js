import createRouter from 'express-promise-router';
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
// import { postSettingsGroup } from '../routes/settings/group/post.js';

// Create main router
const router = createRouter();

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
    if (!req.session.user) res.redirect('/sign-up');
    next();
};
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
// router.post('/settings/group', mustBeAuthenticatedMiddleware, postSettingsGroup);

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
router.get(`/g/:groupId`, getGroups);

// Inbox
router.get('/inbox', mustBeAuthenticatedMiddleware, getInbox);

// Leaving
router.get('/leaving', getLeaving);

export {
    router
};
