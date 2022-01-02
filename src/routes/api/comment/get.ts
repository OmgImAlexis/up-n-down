import type { Request, Response } from 'express';
import { validate as validateUUID } from 'uuid';
import { getCommentWithPublic2 } from '../../../common/comment/get-comment-with-public-2.js';
import { isUserAllowedToViewPost } from '../../../common/post/is-user-allowed-to-view-post.js';
import { getCommentComments } from '../../../common/comment/get-comment-comments.js';
import httpErrors from 'http-errors';

const { NotFound, Forbidden } = httpErrors;

export const getComment = async (request: Request, response: Response) => {
	const commentPublicId = request.params.commentId;
	if (!validateUUID(commentPublicId)) {
		throw new NotFound('Comment ID is not a valid UUID');
	}

	const userId = -1;
	const filterUserId = 1;

	const comment = await getCommentWithPublic2(commentPublicId, 'UTC', userId, filterUserId);
	if (!comment) {
		throw new NotFound('No comment found with that ID');
	}

	const isAllowed = await isUserAllowedToViewPost(comment?.private_group_ids ?? [], userId);
	if (!isAllowed) {
		throw new Forbidden('You do not have permission to view this post');
	}

	const isDiscoverMode = (typeof request.query.viewmode !== 'undefined' && request.query.viewmode === 'string' && request.query.viewmode.toLowerCase() === 'discover');
	const comments = await getCommentComments(comment.path, 'UTC', userId, isDiscoverMode, filterUserId);

	const comments2 = [];
	const rootDotCount = (comment.path.match(/\./g) || []).length;

	for (const comment of comments) {
		const dotCount = (comment.path.match(/\./g) || []).length;

		comments2.push({
			comment_text: comment.is_visible ? comment.text_content : false,
			indent_level: dotCount - rootDotCount - 1,
			by: comment.username,
			comment_time: comment.created_on_raw,
			comment_id: comment.public_id,
		});
	}

	const r = {
		comment_text: comment.is_visible ? comment.text_content : false,
		comment_time: comment.created_on_raw,
		by: comment.username,
		comments: comments2,
	};

	response.json(r);
};
