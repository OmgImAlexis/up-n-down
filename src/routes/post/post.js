import { getCurrentTimezone } from '../../common/get-current-timezone.js';
import { isDiscover } from '../../common/is-discover.js';
import { getCurrentSiteMaxWidth } from '../../common/get-current-site-max-width.js';
import { getCurrentCommentReplyMode } from '../../common/get-current-comment-reply-mode.js';
import { getCurrentEyesId } from '../../common/get-current-eyes-id.js';
import { getPostWithPublic2 } from '../../common/post/get-post-with-public-2.js';
import { isUserAllowedToViewPost } from '../../common/post/is-user-allowed-to-view-post.js';
import { getPostComments } from '../../common/comment/get-post-comments.js';
import { processComment } from '../../common/comment/process-comment.js';
import { createPostComment } from '../../common/comment/create-post-comment.js';
import { commentsPerPage } from '../../config/index.js';

/**
 * Add a comment to this post.
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @returns 
 */
export const postPost = async (req, res) => {
    const postPublicId = req.params.postId;
    const userId = req.session.user ? req.session.user.user_id : -1;
    const filterUserId = await getCurrentEyesId(req);
    const post = await getPostWithPublic2(postPublicId, getCurrentTimezone(req), userId, filterUserId);

    try {
        // Bail if no post was found
        if (!post) return res.send('not found');

        // Render an error page if they're not allowed
        const isAllowed = await isUserAllowedToViewPost(post.private_group_ids, req.session.user.user_id);
        if (!isAllowed) throw new Error('This post is from a private group and you do not have access.');

        // Process the comment
        const comment = processComment(req.body.text_content);

        // Save the comment to the database
        await createPostComment(post.post_id, req.session.user.user_id, comment);

        // Redirect the user to the newly created comment
        const numComments = post.num_comments + 1;
        const pages = Math.ceil(numComments / commentsPerPage);
        const redirectUrl = (pages > 1) ? `/p/${postPublicId}?p=${pages}#${comment.public_id}` : `/p/${postPublicId}#${comment.public_id}`;
        return res.redirect(redirectUrl);
    } catch (error) {
        // Get the requested page or fall back to 1
        const requestedPage = Array.isArray(req.query.p) ? req.query.p[0] : req.query.p;
        const page = parseInt(requestedPage?.toString() ?? '1', 10);

        // Check if discover mode is enabled
        const isDiscoverModeEnabled = isDiscover(req);

        const comments = await getPostComments(post.post_id, getCurrentTimezone(req), userId, isDiscoverModeEnabled, filterUserId, page);

        // Set the title to depending on the user's permissions
        const title = post.is_visible ? post.title : 'Post #' + post.public_id;

        // Render error
        return res.render('single-post', {
            title,
            post,
            comments,
            error,
            is_discover_mode: isDiscoverModeEnabled,
            comment_reply_mode: getCurrentCommentReplyMode(req),
            page
        });
    }
};

