import type { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { createUser } from '../../common/user/create-user.js';
import { createPrivateNotification } from '../../common/firehose.js';
import { getRemoteIp } from '../../common/get-remote-ip.js';

const title = 'Sign Up';

/**
 * Render signup page.
 */
export const getSignup = (request: Request, response: Response) => {
	if (request.session.user) {
		return response.render('message', {
			html: {
				title,
			},
			message: 'You already signed up. If you want to create another account then please <a href="/logout">log out</a>.',
		});
	}

	return response.render('auth/sign-up', {
		html: {
			title,
		},
		autoLogin: 'yes',
	});
};

/**
 * Process signup form.
 */
export const postSignup = async (request: Request, response: Response) => {
	// Check body for validation errors
	const [validationError] = validationResult(request).array({ onlyFirstError: true });
	if (validationError) {
		return response.render('auth/sign-up', {
			html: {
				title,
			},
			error: new Error(validationError.msg),
			username: request.body.username,
			autoLogin: request.body.autoLogin,
		});
	}

	const { username, password } = request.body ?? {};

	try {
		// Create the user
		const user = await createUser(username, password);

		// If the user ticked auto login then
		// authenticate them and redirect them to the homepage
		if (request.body.auto_login === 'yes') {
			// Notify user of login
			createPrivateNotification(user.user_id, {
				title: 'Successful login detected on your account',
				content: `IP: ${getRemoteIp(request)}<br>Time: ${new Date()}`,
			});

			request.session.user = user;
			return response.redirect('/');
		}

		// Show success message
		return response.render('message', {
			html: {
				title,
			},
			message: 'Sign up was successful, you can now <a href="/login">log in</a>.',
		});
	} catch (error) {
		// Render error page
		const errorMessage = error.constraint === 'username_unique_idx' ? `"${username}" already taken` : 'unknown error, please try again';
		return response.render('auth/sign-up', {
			html: {
				title,
			},
			error: new Error(errorMessage),
			username: request.body.username,
			autoLogin: request.body.autoLogin,
		});
	}
};
