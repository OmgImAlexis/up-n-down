/**
 * Render the edit page for a comment.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns
 */
export const getCommentEdit = async (req, res) => {
	try {
		const commentPublicId = req.params.commentId;
		const comment = await getCommentWithPublic(commentPublicId);
		if (!comment) {
			throw new Error('Unknown comment.');
		}

		if (comment.user_id !== req.session.user.user_id) {
			throw new Error('Permission denied!');
		}

		res.render('edit-comment', {
			html: {
				title: 'Edit Comment',
			},
			textContent: comment.text_content,
		});
	} catch (error) {
		res.render('edit-comment', {
			html: {
				title: 'Edit Comment',
			},
			error,
		});
	}
};
