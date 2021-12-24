import { getCurrentEyesId } from '../../common/get-current-eyes-id.js';
import { getCurrentTimezone } from '../../common/get-current-timezone.js';
import { getCommentWithPublic2 } from '../../common/comment/get-comment-with-public-2.js';

/**
 * Render a comment.
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @returns 
 */
export const getComment = async (req, res) => {
    const commentPublicId = req.params.commentId;
    const finalUserId = req.session.user.user_id ?? -1;
    const filterUserId = await getCurrentEyesId(req);
    const comment = await getCommentWithPublic2(commentPublicId, getCurrentTimezone(req), finalUserId, filterUserId);
    if (!comment) throw new Error('Unknown comment.');
    if (comment.user_id !== req.session.user.user_id) throw new Error('Permission denied!');

    const isAllowed = await db.isUserAllowedToViewPost(comment.private_group_ids, finalUserId)
    if(!isAllowed) throw new Error("This comment is from a private group and you do not have access.");

    //
    let page = 1;

    if(typeof req.query.p !== 'undefined') {
        page = parseInt(req.query.p)

        if(isNaN(page)) {
            return res.redirect(`/c/${commentPublicId}`)
        }
    }

    //
    const isDiscoverMode = isDiscover(req);

    const comments = await getCommentComments(comment.path, getCurrentTimezone(req), finalUserId, isDiscoverMode, filterUserId, page);

    res.render('single-comment', {
        html: {
            title: `${htmlTitleComment} ${commentPublicId}`
        },
        post_public_id: rows[0].post_public_id,
        comment,
        comments,
        is_discover_mode: isDiscoverMode,
        comment_reply_mode: getCurrentCommentReplyMode(req),
        page
    });
};
