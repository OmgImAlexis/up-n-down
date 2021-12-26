import { validate as validateUUID } from 'uuid';
import { getCommentWithPublic2 } from '../../../common/comment/get-comment-with-public-2.js';
import { isUserAllowedToViewPost } from '../../../common/post/is-user-allowed-to-view-post.js';
import { getCommentComments } from '../../../common/comment/get-comment-comments.js';
import httpErrors from 'http-errors';

const { NotFound, Forbidden } = httpErrors;

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns
 */
export const getComment = async (req, res) => {
	const commentPublicId = req.params.commentId;
	if (!validateUUID(commentPublicId)) {
		throw new NotFound('Comment ID is not a valid UUID');
	}

	const userId = -1;
	const filterUserId = 1;

	const comment = await getCommentWithPublic2(commentPublicId, 'UTC', userId, filterUserId);
	if (!comment) {
		throw new NotFound('No comment found with that ID');
	}

	const isAllowed = await isUserAllowedToViewPost(comment.private_group_ids, userId);
	if (!isAllowed) {
		throw new Forbidden('You do not have permission to view this post');
	}

	let isDiscoverMode = false;
	if (typeof req.query.viewmode !== 'undefined' && req.query.viewmode.toLowerCase() === 'discover') {
		isDiscoverMode = true;
	}

	const comments = await getCommentComments(comment.path, 'UTC', userId, isDiscoverMode, filterUserId);

	//
	const comments2 = [];
	const rootDotCount = (comment.path.match(/\./g) || []).length;

	for (const c of comments) {
		const dotCount = (c.path.match(/\./g) || []).length;

		comments2.push({
			comment_text: c.is_visible ? c.text_content : false,
			indent_level: dotCount - rootDotCount - 1,
			by: c.username,
			comment_time: c.created_on_raw,
			comment_id: c.public_id,
		});
	}

	const r = {
		comment_text: comment.is_visible ? comment.text_content : false,
		comment_time: comment.created_on_raw,
		by: comment.username,
		comments: comments2,
	};

	res.json(r);
};
