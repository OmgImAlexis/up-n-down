import { getCurrentEyesId } from '../../common/settings/get-current-eyes-id.js';
import { getCommentWithPublic2 } from '../../common/comment/get-comment-with-public-2.js';
import { isUserAllowedToViewPost } from '../../common/post/is-user-allowed-to-view-post.js';
import { processComment } from '../../common/comment/process-comment.js';
import { getCurrentCommentReplyMode } from '../../common/settings/get-current-comment-reply-mode.js';
import { getCurrentTimezone } from '../../common/settings/get-current-timezone.js';
import { isDiscover } from '../../common/is-discover.js';
import { getCommentComments } from '../../common/comment/get-comment-comments.js';
import { createCommentComment } from '../../common/comment/create-comment-comment.js';

export const postComment = async (req, res) => {
	const commentPublicId = req.params.commentId;
	const finalUserId = req.session?.user?.user_id ?? -1;
	const filterUserId = await getCurrentEyesId(req);
	const comment = await getCommentWithPublic2(commentPublicId, getCurrentTimezone(req), finalUserId, filterUserId);

	try {
		if (!comment) {
			throw new Error('Unknown comment.');
		}

		if (comment.user_id !== req.session.user.user_id) {
			throw new Error('Permission denied!');
		}

		const isAllowed = await isUserAllowedToViewPost(comment.private_group_ids, finalUserId);
		if (!isAllowed) {
			throw new Error('This comment is from a private group and you do not have access.');
		}

		const trimmedComment = processComment(req.body.text_content);

		const reply = await createCommentComment({
			postId: comment.post_id,
			userId: req.session.user.user_id,
			comment: trimmedComment,
			parentPath: comment.path,
			timezone: 'UTC',
		});

		return res.redirect(`/c/${commentPublicId}#${reply.public_id}`);
	} catch (error) {
		//
		const isDiscoverMode = isDiscover(req);

		const comments = await getCommentComments(comment.path, getCurrentTimezone(req), finalUserId, isDiscoverMode, filterUserId);

		res.render('single-comment', {
			html: {
				title: commentPublicId,
			},
			post_public_id: comment.post_public_id,
			comment,
			comments,
			error,
			isDiscoverMode,
			comment_reply_mode: getCurrentCommentReplyMode(req),
		});
	}
};
