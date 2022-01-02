import type { Request, Response } from 'express';
import { getUserFollowees } from '../../common/user/get-user-followees.js';
import { getUserWithPublicId } from '../../common/user/get-user-with-public-id.js';
import { isUserFollowing } from '../../common/user/is-user-following.js';
import { addFollower } from '../../common/user/add-follower.js';
import { removeFollower } from '../../common/user/remove-follower.js';

export const getFollowing = async (request: Request, response: Response) => {
	// Redirect to signup if the user isn't signed in
	if (!request.session.user) {
		return response.redirect('/sign-up');
	}

	const formUsername = request.body.username ?? '';

	try {
		switch (true) {
			case request.query.follow !== undefined: {
				const userPublicId = request.query.follow;

				// Check if the user exists
				const user = await getUserWithPublicId(userPublicId);
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
			}

			case request.query.unfollow !== undefined: {
				const userPublicId = request.query.unfollow;

				// Check if user exists
				const user = await getUserWithPublicId(userPublicId);
				if (!user) {
					throw new Error('No such user');
				}

				// Check if the user is trying to unfollow themselves
				if (request.session.user.user_id === user.user_id) {
					throw new Error('You can\'t unfollow yourself');
				}

				// Check if they're following that user
				const isFollowing = await isUserFollowing(request.session.user.user_id, user.user_id);
				if (!isFollowing) {
					throw new Error('You are not following that user');
				}

				// Unfollow the user
				await removeFollower(request.session.user.user_id, user.user_id);

				// Redirect either to the goto address or unfollowed success page
				return response.redirect(request.query.goto ?? `/following?unfollowed=${user.username}`);
			}

			case request.query.followed !== undefined: {
				// Render success page
				return response.render('following', {
					html: {
						title: 'Following',
					},
					info: {
						message: `You followed ${request.query.followed}`,
					},
					followees: await getUserFollowees(request.session.user.user_id),
					formUsername,
				});
			}

			case request.query.unfollowed !== undefined: {
				// Render success page
				return response.render('following', {
					html: {
						title: 'Following',
					},
					info: {
						message: `You unfollowed ${request.query.unfollowed}`,
					},
					followees: await getUserFollowees(request.session.user.user_id),
					formUsername,
				});
			}

			default: {
				// Render following page
				return response.render('following', {
					html: {
						title: 'Following',
					},
					followees: await getUserFollowees(request.session.user.user_id),
					formUsername,
				});
			}
		}
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
