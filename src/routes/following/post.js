import { getUserFollowees } from '../../common/user/get-user-followees.js';
import { getUserWithUsername } from '../../common/user/get-user-with-username.js';
import { isUserFollowing } from '../../common/user/is-user-following.js';
import { addFollower } from '../../common/user/add-follower.js';

export const postFollowing = async (req, res) => {
	// Redirect to signup if the user isn't signed in
	if (!req.session.user) {
		return res.redirect('/sign-up');
	}

	const formUsername = req.body.username ?? '';

	try {
		// Check if the user exists
		const user = await getUserWithUsername(formUsername);
		if (!user) {
			throw new Error('No such user');
		}

		// Check if the user is trying to follow themselves
		if (req.session.user.user_id == user.user_id) {
			throw new Error('You can\'t follow yourself');
		}

		// Check if the user is already following them
		const isAlreadyFollowing = await isUserFollowing(req.session.user.user_id, user.user_id);
		if (isAlreadyFollowing) {
			throw new Error('You are already following that user');
		}

		// Follow the user
		await addFollower(req.session.user.user_id, user.user_id);

		// Redirect either to the goto address or following success page
		return res.redirect(req.query.goto ?? `/following?followed=${user.username}`);
	} catch (error) {
		// Render error page
		res.render('following', {
			html: {
				title: 'Following',
			},
			error,
			followees: await getUserFollowees(req.session.user.user_id),
			formUsername,
		});
	}
};
