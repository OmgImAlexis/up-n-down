import { getCurrentTimezone } from '../../common/get-current-timezone.js';
import { isDiscover } from '../../common/is-discover.js';
import { getCurrentSiteMaxWidth } from '../../common/get-current-site-max-width.js';
import { getCurrentCommentReplyMode } from '../../common/get-current-comment-reply-mode.js';
import { getCurrentEyesId } from '../../common/get-current-eyes-id.js';
import { getPostWithPublic2 } from '../../common/get-post-with-public-2.js';
import { isUserAllowedToViewPost } from '../../common/post/is-user-allowed-to-view-post.js';
import { getPostComments } from '../../common/post/get-post-comments.js';

/**
 * Render a single post by it's ID
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @returns {void | import('express').Response}
 */
export const getDisplaySinglePost = async (req, res) => {
    const postPublicId = req.params[0];
    const finalUserId = req.session.user ? req.session.user.user_id : -1;
    const filterUserId = await getCurrentEyesId(req);

    // Fetch the current post
    const { rows: [post] } = await getPostWithPublic2(postPublicId, getCurrentTimezone(req), finalUserId, filterUserId);

    // Bail if we didn't get a post back
    if(!post) return res.send('not found');

    // Render an error page if they're not allowed
    const isAllowed = await isUserAllowedToViewPost(post.private_group_ids, finalUserId);
    if (!isAllowed) {
        return res.render('message', {
            title: 'Post #' + post.public_id,
            message: "This post is from a private group and you do not have access.",
            max_width: getCurrentSiteMaxWidth(req)
        });
    }

    // Get the requested page or fall back to 1
    const requestedPage = Array.isArray(req.query.p) ? req.query.p[0] : req.query.p;
    const page = parseInt(requestedPage?.toString() ?? '1', 10);

    // Check if discover mode is enabled
    const isDiscoverModeEnabled = isDiscover(req);

    // Get the comments for this post
    const { rows: comments } = await getPostComments(post.post_id, getCurrentTimezone(req), finalUserId, isDiscoverModeEnabled, filterUserId, page);

    // Set the title to depending on the user's permissions
    const title = post.is_visible ? post.title : 'Post #' + post.public_id;

    // Render the post
    res.render('single-post', {
        html: {
            title
        },
        title,
        post,
        comments,
        comment_reply_mode: getCurrentCommentReplyMode(req),
        page
    });
};
