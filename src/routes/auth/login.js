import { getUserWithUsername } from '../../common/user/get-user-with-username.js';
import { validatePassword } from '../../common/auth/validate-password.js';
import { pushToPrivateFirehose } from '../../common/firehouse.js';

const title = 'Log In';

/**
 * Render the login page.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns
 */
export const getLogin = (req, res) => {
	// Don't allow users to login twice
	if (req.session.user) {
		return res.render('message', {
			title,
			message: 'You\'re already logged in. If you want to log in with a different account then please log out.',
		});
	}

	// Render login page
	return res.render('auth/login', {
		html: {
			title,
		},
	});
};

/**
 * Process the login form.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns
 */
export const postLogin = async (req, res) => {
	try {
		const user = await getUserWithUsername(req.body.username);

		// No user found with the username
		if (!user) {
			throw new Error('Invalid username or password');
		}

		// Password doesn't match the database
		if (!await validatePassword(user.password, req.body.password)) {
			throw new Error('Invalid username or password');
		}

		// Push reply to firehose
		pushToPrivateFirehose(user.user_id, 'notification', {
			title: 'Login detected on your account',
			content: new Date(),
		});

		req.session.user = user;
		return res.redirect('/');
	} catch (error) {
		res.render('auth/login', {
			html: {
				title,
			},
			error,
		});
	}
};
