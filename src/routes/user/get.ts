import type { Request, Response } from 'express';
import { getPosts } from '../../common/post/get-posts.js';
import { getPostSort } from '../../common/post/get-post-sort.js';
import { isDiscover } from '../../common/is-discover.js';
import { getCurrentTimezone } from '../../common/settings/get-current-timezone.js';
import { getCurrentEyesId } from '../../common/settings/get-current-eyes-id.js';
import { getPageNumber } from '../../common/get-page-number.js';

export const getUser = async (request: Request, response: Response) => {
	const { username } = request.params;
	const userId = request.session.user?.user_id ?? -1;
	const page = getPageNumber(request);
	const sort = getPostSort(request);
	const isDiscoverMode = isDiscover(request);
	const filterUserId = await getCurrentEyesId(request);
	const posts = await getPosts(userId, getCurrentTimezone(request), page, isDiscoverMode, filterUserId, sort);

	response.render('posts/feed', {
		html: {
			title: username,
		},
		posts,
		page,
		baseUrl: '/',
		sort,
	});
};
