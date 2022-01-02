import type { Request, Response } from 'express';
import { getCommentWithPublicId } from '../../../common/comment/get-comment-with-public-id.js';

/**
 * Render the edit page for a comment.
 */
export const getCommentEdit = async (request: Request, response: Response) => {
	try {
		const commentPublicId = request.params.commentId;
		const comment = await getCommentWithPublicId(commentPublicId);

		if (!comment) throw new Error('Unknown comment.');
		if (comment.user_id !== request.session.user.user_id) throw new Error('Permission denied!');

		response.render('edit-comment', {
			html: {
				title: 'Edit Comment',
			},
			textContent: comment.text_content,
		});
	} catch (error) {
		response.render('edit-comment', {
			html: {
				title: 'Edit Comment',
			},
			error,
		});
	}
};
