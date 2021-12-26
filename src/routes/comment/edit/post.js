import { processComment } from '../../../common/comment/process-comment.js';
import { getCommentWithPublicId } from '../../../common/comment/get-comment-with-public-id.js';
import { updateComment } from '../../../common/comment/update-comment.js';

/**
 * Edit a comment.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns
 */
export const postCommentEdit = async (req, res) => {
	try {
		const commentPublicId = req.params.commentId;
		const { comment_id, user_id } = await getCommentWithPublicId(commentPublicId);
		if (!comment_id) {
			throw new Error('Unknown comment.');
		}

		if (user_id !== req.session.user.user_id) {
			throw new Error('Permission denied!');
		}

		const comment = processComment(req.body.text_content);
		await updateComment(comment_id, comment);
		return res.redirect(`/c/${commentPublicId}`);
	} catch (error) {
		res.render('edit-comment', {
			html_title: 'Edit Comment',
			error,
		});
	}
};
