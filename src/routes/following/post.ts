import type { Request, Response } from 'express';
import { getUserFollowees } from '../../common/user/get-user-followees.js';
import { getUserWithUsername } from '../../common/user/get-user-with-username.js';
import { isUserFollowing } from '../../common/user/is-user-following.js';
import { addFollower } from '../../common/user/add-follower.js';

export const postFollowing = async (request: Request, response: Response) => {
	// Redirect to signup if the user isn't signed in
	if (!request.session.user) {
		return response.redirect('/sign-up');
	}

	const formUsername = request.body.username ?? '';

	try {
		// Check if the user exists
		const user = await getUserWithUsername(formUsername);
		if (!user) {
			throw new Error('No such user');
		}

		// Check if the user is trying to follow themselves
		if (request.session.user.user_id === user.user_id) {
			throw new Error('You can\'t follow yourself');
		}

		// Check if the user is already following them
		const isAlreadyFollowing = await isUserFollowing(request.session.user.user_id, user.user_id);
		if (isAlreadyFollowing) {
			throw new Error('You are already following that user');
		}

		// Follow the user
		await addFollower(request.session.user.user_id, user.user_id);

		// Redirect either to the goto address or following success page
		return response.redirect(request.query.goto ?? `/following?followed=${user.username}`);
	} catch (error) {
		// Render error page
		response.render('following', {
			html: {
				title: 'Following',
			},
			error,
			followees: await getUserFollowees(request.session.user.user_id),
			formUsername,
		});
	}
};
