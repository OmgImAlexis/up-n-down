import type { Request, Response } from 'express';
import { getPostSort } from '../../../common/post/get-post-sort.js';
import { getPosts as getPostFromDatabase } from '../../../common/post/get-posts.js';
import { getPageNumber } from '../../../common/get-page-number.js';

export const getPosts = async (request: Request, response: Response) => {
	const page = getPageNumber(request);
	const isDiscoverMode = typeof request.query.viewmode === 'string' && request.query.viewmode.toLowerCase() === 'discover';
	const userId = -1;
	const filterUserId = 1;
	const sort = getPostSort(request);

	const posts = await getPostFromDatabase(userId, 'UTC', page, isDiscoverMode, filterUserId, sort);

	response.json(posts.map(post => ({
		post_id: post.public_id,
		title: post.is_visible ? post.title : false,
		link: post.is_visible ? post.link : false,
		post_time: post.created_on_raw,
		by: post.username,
		num_comments: post.num_comments,
		groups: post.tags,
	})));
};
