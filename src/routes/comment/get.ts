import type { Request, Response } from 'express';
import { getCurrentEyesId } from '../../common/settings/get-current-eyes-id.js';
import { getCurrentTimezone } from '../../common/settings/get-current-timezone.js';
import { getCommentWithPublic2 } from '../../common/comment/get-comment-with-public-2.js';
import { isUserAllowedToViewPost } from '../../common/post/is-user-allowed-to-view-post.js';
import { isDiscover } from '../../common/is-discover.js';
import { getCommentComments } from '../../common/comment/get-comment-comments.js';
import { getCurrentCommentReplyMode } from '../../common/settings/get-current-comment-reply-mode.js';
import { getPageNumber } from '../../common/get-page-number.js';

/**
 * Render a comment.
 */
export const getComment = async (request: Request, response: Response) => {
	try {
		const commentPublicId = request.params.commentId;
		const finalUserId = request.session?.user?.user_id ?? -1;
		const filterUserId = await getCurrentEyesId(request);
		const comment = await getCommentWithPublic2(commentPublicId, getCurrentTimezone(request), finalUserId, filterUserId);

		if (!comment) throw new Error('Unknown comment.');
		if (comment.user_id !== request.session.user.user_id) throw new Error('Permission denied!');

		const isAllowed = await isUserAllowedToViewPost(comment.private_group_ids, finalUserId);
		if (!isAllowed) throw new Error('This comment is from a private group and you do not have access.');

		const page = getPageNumber(request);
		const isDiscoverMode = isDiscover(request);

		const comments = await getCommentComments(comment.path, getCurrentTimezone(request), finalUserId, isDiscoverMode, filterUserId, page);

		response.render('single-comment', {
			html: {
				title: commentPublicId,
			},
			post_public_id: comment.post_public_id,
			comment,
			comments,
			isDiscoverMode,
			comment_reply_mode: getCurrentCommentReplyMode(request),
			page,
		});
	} catch (error) {
		response.render('single-comment', {
			html: {
				title: '',
			},
			error,
		});
	}
};
