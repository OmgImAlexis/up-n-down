import type { Request, Response } from 'express';
import { getPostWithPublic2 } from '../../../common/post/get-post-with-public-2.js';
import { isUserAllowedToViewPost } from '../../../common/post/is-user-allowed-to-view-post.js';
import { getPostComments } from '../../../common/comment/get-post-comments.js';

export const getPost = async (request: Request, response: Response) => {
	if (typeof request.query.postid === 'undefined') {
		return response.json(0);
	}

	const postPublicId = request.query.postid as string;
	const userId = -1;
	const filterUserId = 1;
	const post = await getPostWithPublic2(
		postPublicId,
		'UTC',
		userId,
		filterUserId);

	if (!post) return response.json(0);

	const isAllowed = await isUserAllowedToViewPost(
		post.private_group_ids,
		userId);

	if (!isAllowed) {
		return response.json(0);
	}

	const isDiscoverMode = typeof request.query.viewmode === 'string' && request.query.viewmode.toLowerCase() === 'discover';

	const comments = await getPostComments(
		post.post_id,
		'UTC',
		userId,
		isDiscoverMode,
		filterUserId, 1);

	return response.json({
		title: post.is_visible ? post.title : false,
		link: post.is_visible ? post.link : false,
		post_text: post.is_visible ? post.text_content : false,
		post_time: post.created_on_raw,
		by: post.username,
		comments: comments.map(comment => {
			const dotCount = (comment.path.match(/\./g) || []).length;

			return {
				comment_text: comment.is_visible ? comment.text_content : false,
				indent_level: dotCount - 1,
				by: comment.username,
				comment_time: comment.created_on_raw,
				comment_id: comment.public_id,
			};
		}),
		groups: post.tags,
	});
};
