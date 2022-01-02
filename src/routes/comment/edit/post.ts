import type { Request, Response } from 'express';
import { processComment } from '../../../common/comment/process-comment.js';
import { getCommentWithPublicId } from '../../../common/comment/get-comment-with-public-id.js';
import { updateComment } from '../../../common/comment/update-comment.js';

/**
 * Edit a comment.
 */
export const postCommentEdit = async (request: Request, response: Response) => {
	try {
		const commentPublicId = request.params.commentId;
		const { comment_id, user_id } = await getCommentWithPublicId(commentPublicId);

		if (!comment_id) throw new Error('Unknown comment.');
		if (user_id !== request.session.user.user_id) throw new Error('Permission denied!');

		const comment = processComment(request.body.text_content);
		await updateComment(comment_id, comment);
		return response.redirect(`/c/${commentPublicId}`);
	} catch (error) {
		response.render('edit-comment', {
			html_title: 'Edit Comment',
			error,
		});
	}
};
