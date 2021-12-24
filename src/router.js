import createRouter from 'express-promise-router';
import { body as validateBody } from 'express-validator';
import { home } from './routes/home.js';
import { getSettings } from './routes/settings/get.js';
import { postSettings } from './routes/settings/post.js';
import { getSettingsUsername } from './routes/settings/username/get.js';
import { postSettingsUsername } from './routes/settings/username/post.js';
import { renderPage } from './common/render-page.js';
import { getLogin, postLogin } from './routes/login.js';
import { getSignup, postSignup } from './routes/sign-up.js';
import { getNew } from './routes/new/get.js';
import { postNew } from './routes/new/post.js';
import { getDisplaySinglePost } from './routes/display-single-post/get.js';
import { getFollowing } from './routes/following/get.js';

const router = createRouter();

// Static routes
router.route('/manual').get(renderPage('instruction-manual', { title: 'Manual' }));
router.route('/privacy-policy').get(renderPage('privacy-policy', { title: 'Privacy Policy' }));
router.route('/contact-us').get(renderPage('contact-us', { title: 'Contact Us' }));
router.route('/api').get(renderPage('api', { title: 'API' }));

// Logout page
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

const usernameRegex = /^[a-z0-9-]{4,16}$/i;
const usernameMiddleware = validateBody('username', 'Username must be 4-16 characters (letters, numbers and dashes only)').notEmpty().withMessage('Please fill in a username').matches(usernameRegex);
const passwordMiddleware = validateBody('password', 'Password must be 9-100 characters').notEmpty().withMessage('Please fill in a password').matches(/^.{9,100}$/);

router.get('/', home);
router.get('/settings', getSettings);
router.post('/settings', postSettings);
router.get('/settings/username/', getSettingsUsername);
router.post('/settings/username/', postSettingsUsername);
// app.use('/settings/groups/', require('./routes/user-settings-groups'));
// app.use('/settings/group/', require('./routes/user-settings-group'));
router.get('/sign-up', getSignup);
router.post('/sign-up', usernameMiddleware, passwordMiddleware, postSignup);
router.get('/login', getLogin);
router.post('/login', postLogin);
router.get('/new', getNew);
router.post('/new', postNew);
router.use(/^\/p\/([a-z0-9]{22})$/i, getDisplaySinglePost);
// app.use(/^\/p\/([a-z0-9]{22})\/edit$/i, require('./routes/single-post-edit'));
// app.use(/^\/c\/([a-z0-9]{22})$/i, require('./routes/single-comment-display'));
// app.use(/^\/c\/([a-z0-9]{22})\/edit$/i, require('./routes/single-comment-edit'));
router.get('/following/', getFollowing);
// app.use(/^\/r\/([a-z0-9-]{3,20})$/, require('./routes/group-posts'));
// app.use('/inbox/', require('./routes/inbox'));
// app.use('/api/v1/', require('./routes/api'));

export {
    router
};
