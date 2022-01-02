import type { Request, Response } from 'express';
import argon2 from 'argon2';
import { getUserWithUsername } from '../../../common/user/get-user-with-username.js';
import { getUserWithUserId } from '../../../common/user/get-user-with-user-id.js';
import { updateUserUsername } from '../../../common/user/update-user-username.js';

const title = 'Settings / Username';
const regexUsername = /^[a-z0-9-]{4,16}$/i;

const isUsernameTaken = async (currentUserId: number, username: string) => {
	// Check the username isn't taken
	const user = await getUserWithUsername(username);

	// If we found a user check that it's not the current user
	return user.user_id !== currentUserId;
};

export const postSettingsUsername = async (request: Request, response: Response) => {
	const { username } = request.body;

	try {
		if (!request.session.user) {
			response.redirect('/sign-up');
		}

		// Check username is correct length and only using letters, numbers and dashes
		if (!username.match(regexUsername)) {
			throw new Error('Username must be 4-16 characters(letters, numbers and dashes only).');
		}

		// Check if the username has been taken by another user
		if (await isUsernameTaken(request.session.user.user_id, username)) {
			throw new Error('Username already taken.');
		}

		// Check the password is correct
		const user = await getUserWithUserId(request.session.user.user_id);
		if (!await argon2.verify(user.password, request.body.password)) {
			throw new Error('Invalid password.');
		}

		// Update the user's username
		await updateUserUsername(request.session.user.user_id, username);
		request.session.user.username = username;

		// Render success page
		response.render('my-settings-username', {
			html: {
				title,
			},
			username,
			info: {
				message: 'Username successfully saved',
			},
		});
	} catch (error) {
		response.render('my-settings-username', {
			html: {
				title,
			},
			username,
			error,
		});
	}
};
