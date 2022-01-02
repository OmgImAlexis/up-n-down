import type { Request, Response } from 'express';
import { getUserWithUsername } from '../../common/user/get-user-with-username.js';
import { validatePassword } from '../../common/auth/validate-password.js';
import { createPrivateNotification } from '../../common/firehose.js';
import { getRemoteIp } from '../../common/get-remote-ip.js';

const title = 'Log In';

/**
 * Render the login page.
 */
export const getLogin = (request: Request, response: Response) => {
	// Don't allow users to login twice
	if (request.session.user) {
		return response.render('message', {
			title,
			message: 'You\'re already logged in. If you want to log in with a different account then please log out.',
		});
	}

	// Render login page
	return response.render('auth/login', {
		html: {
			title,
		},
	});
};

/**
 * Process the login form.
 */
export const postLogin = async (request: Request, response: Response) => {
	try {
		const user = await getUserWithUsername(request.body.username);

		// No user found with the username
		if (!user) {
			throw new Error('Invalid username or password');
		}

		// Password doesn't match the database
		if (!await validatePassword(user.password, request.body.password)) {
			// Notify user of failed login
			createPrivateNotification(user.user_id, {
				title: 'Failed login detected on your account',
				content: `IP: ${getRemoteIp(request)}<br>Time: ${new Date()}<br>Reason: "Invalid password"`,
			});
			throw new Error('Invalid username or password');
		}

		// Notify user of successful login
		createPrivateNotification(user.user_id, {
			title: 'Successful login detected on your account',
			content: `IP: ${getRemoteIp(request)}<br>Time: ${new Date()}`,
		});

		// @todo: This needs to be fixed properly with the getUserWithUsername not returning it.
		// 		  Instead there should be a function which checks the password and has it's own sql statement.
		const { password: _, ...userWithoutPassword } = user;

		request.session.user = userWithoutPassword;
		return response.redirect('/');
	} catch (error) {
		response.render('auth/login', {
			html: {
				title,
			},
			error,
		});
	}
};
