import type Express from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import { getPosts } from '../common/post/get-posts.js';
import { getPostSort } from '../common/post/get-post-sort.js';
import { isDiscover } from '../common/is-discover.js';
import { getCurrentTimezone } from '../common/settings/get-current-timezone.js';
import { getCurrentEyesId } from '../common/settings/get-current-eyes-id.js';

export const home = async (request: Express.Request<ParamsDictionary, unknown, unknown, { p?: string; sort?: "" | "oldest" | "comments" | "last"; }>, response: Express.Response) => {
	const userId = request.session?.user?.user_id ?? -1;
	const requestedPage = parseInt(request.query.p ?? '', 10);
	const page = isNaN(requestedPage) ? 1 : requestedPage;
	const sort = getPostSort(request);
	const isDiscoverMode = isDiscover(request);
	const filterUserId = await getCurrentEyesId(request);
	const posts = await getPosts(userId, getCurrentTimezone(request), page, isDiscoverMode, filterUserId, sort);

	response.render('posts/feed', {
		html: {
			title: 'Home',
		},
		posts,
		page,
		baseUrl: '/',
		isDiscoverMode,
		sort,
	});
};
