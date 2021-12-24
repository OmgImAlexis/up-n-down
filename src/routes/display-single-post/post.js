const { getCurrentTimezone } = require('src/common/get-current-timezone');
const { isDiscover } = require('src/common/is-discover');
const { getCurrentSiteMaxWidth } = require('src/common/get-current-site-max-width');
const { getCurrentCommentReplyMode } = require('src/common/get-current-comment-reply-mode');
const { processComment } = require('src/common/process-comment');

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @returns 
 */
export const postDisplaySinglePost = async (req, res) => {
    // Bail if the user isn't authenticated
    // @todo: This should be middleware
    if (!req.session.user) return res.send('nope...');

    const postPublicId = req.params[0];
    const finalUserId = req.session.user ? req.session.user.user_id : -1;
    const filterUserId = await db.getCurrEyesId(req);

    const { rows: [post] } = await db.getPostWithPublic2(postPublicId, getCurrentTimezone(req), finalUserId, filterUserId);

    // Bail if no post was found
    if (!post) return res.send('not found');

    // Render an error page if they're not allowed
    const isAllowed = await db.isUserAllowedToViewPost(post.private_group_ids, req.session.user.user_id);
    if (!isAllowed) {
        return res.render('message', {
            title: 'Post #' + post.public_id,
            message: "This post is from a private group and you do not have access.",
            user: req.session.user,
            max_width: getCurrentSiteMaxWidth(req)
        });
    }

    // Process the comment
    const [compressedComment, errors] = processComment(req.body.text_content);

    // Render an error page if we found any errors in the comment
    if (errors.length > 0) {
        // Get the requested page or fall back to 1
        const requestedPage = Array.isArray(req.query.p) ? req.query.p[0] : req.query.p;
        const page = parseInt(requestedPage?.toString() ?? '1', 10);

        // Check if discover mode is enabled
        const isDiscoverModeEnabled = isDiscover(req);

        const { rows: comments } = await db.getPostComments(post.post_id, getCurrentTimezone(req), finalUserId, isDiscoverModeEnabled, filterUserId, page);

        // Set the title to depending on the user's permissions
        const title = post.is_visible ? post.title : 'Post #' + post.public_id;

        // Render the post
        return res.render('single-post', {
            title,
            post,
            comments,
            errors,
            is_discover_mode: isDiscoverModeEnabled,
            comment_reply_mode: getCurrentCommentReplyMode(req),
            max_width: getCurrentSiteMaxWidth(req),
            page
        });
    }

    // Save the comment to the database
    const { rows: data1 } = await db.createPostComment(post.post_id, req.session.user.user_id, compressedComment);

    // Update the amount of comments on this post
    await db.incPostNumComments(post.post_id);

    // Redirect the user to the newly created comment
    const numComments = post.num_comments + 1;
    const pages = Math.ceil(numComments / config.commentsPerPage);
    const redirectUrl = (pages > 1) ? `/p/${postPublicId}?p=${pages}#${data1[0].public_id}` : `/p/${postPublicId}#${data1[0].public_id}`;
    return res.redirect(redirectUrl);
};
exports.post = post;
