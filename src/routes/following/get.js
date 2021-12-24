import { getUserFollowees } from '../../common/user/get-user-followees.js';
import { getUserWithPublicId } from '../../common/user/get-user-with-public-id.js';
import { isUserFollowing } from '../../common/user/is-user-following.js';
import { addFollower } from '../../common/user/add-follower.js';
import { removeFollower } from '../../common/user/remove-follower.js';

export const getFollowing = async (req, res) => {
    // Redirect to signup if the user isn't signed in
    if (!req.session.user) return res.redirect('/sign-up');

    const formUsername = req.body.username ?? '';

    try {
        switch (true) {
            case req.query.follow !== undefined: {
                const userPublicId = req.query.follow;

                // Check if the user exists
                const user = await getUserWithPublicId(userPublicId);
                if (!user) throw new Error('No such user');

                // Check if the user is trying to follow themselves
                if(req.session.user.user_id == user.user_id) throw new Error('You can\'t follow yourself');

                // Check if the user is already following them
                const isAlreadyFollowing = await isUserFollowing(req.session.user.user_id, user.user_id);
                if (isAlreadyFollowing) throw new Error('You are already following that user');

                // Follow the user
                await addFollower(req.session.user.user_id, user.user_id);

                // Redirect either to the goto address or following success page
                return res.redirect(req.query.goto ?? `/following?followed=${user.username}`);
            }

            case req.query.unfollow !== undefined: {
                const userPublicId = req.query.unfollow;

                // Check if user exists
                const user = await getUserWithPublicId(userPublicId);
                if (!user) throw new Error('No such user');

                // Check if the user is trying to unfollow themselves
                if(req.session.user.user_id == user.user_id) throw new Error('You can\'t unfollow yourself');

                // Check if they're following that user
                const isFollowing = await isUserFollowing(req.session.user.user_id, user.user_id);
                if (!isFollowing) throw new Error('You are not following that user');

                // Unfollow the user
                await removeFollower(req.session.user.user_id, user.user_id);

                // Redirect either to the goto address or unfollowed success page
                return res.redirect(req.query.goto ?? `/following?unfollowed=${user.username}`);
            }

            case req.query.followed !== undefined: {
                // Render success page
                res.render('following', {
                    html: {
                        title: 'Following'
                    },
                    info: {
                        message: `You followed ${req.query.followed}`
                    },
                    followees: await getUserFollowees(req.session.user.user_id),
                    formUsername
                });
            }

            case req.query.unfollowed !== undefined: {
                // Render success page
                res.render('following', {
                    html: {
                        title: 'Following'
                    },
                    info: {
                        message: `You unfollowed ${req.query.unfollowed}`
                    },
                    followees: await getUserFollowees(req.session.user.user_id),
                    formUsername
                });
            }
        
            default: {
                // Render following page
                res.render('following', {
                    html: {
                        title: 'Following'
                    },
                    followees: await getUserFollowees(req.session.user.user_id),
                    formUsername
                });
            }
        }
    } catch (error) {
        // Render error page
        res.render('following', {
            html: {
                title: 'Following'
            },
            error,
            followees: await getUserFollowees(req.session.user.user_id),
            formUsername
        });
    }
};
