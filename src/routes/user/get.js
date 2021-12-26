import { getPosts } from '../../common/post/get-posts.js';
import { getPostSort } from '../../common/post/get-post-sort.js';
import { isDiscover } from '../../common/is-discover.js';
import { getCurrentTimezone } from '../../common/settings/get-current-timezone.js';
import { getCurrentEyesId } from '../../common/settings/get-current-eyes-id.js';

export const getUser = async (req, res) => {
	const { username } = req.params;
	const userId = req.session.user?.user_id ?? -1;
	const requestedPage = parseInt(req.query.p, 10);
	const page = isNaN(requestedPage) ? 1 : requestedPage;
	const sort = getPostSort(req);

	const isDiscoverMode = isDiscover(req);
	const filterUserId = await getCurrentEyesId(req);

	const posts = await getPosts(userId, getCurrentTimezone(req), page, isDiscoverMode, filterUserId, sort);

	res.render('posts/feed', {
		html: {
			title: username,
		},
		posts,
		page,
		baseUrl: '/',
		sort,
	});
};
