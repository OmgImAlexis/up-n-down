import { getPostSort } from '../../../common/post/get-post-sort.js';

export const getPosts = async (req, res) => {
	//
	let page = 1;

	if (typeof req.query.p !== 'undefined') {
		page = parseInt(req.query.p, 10);

		if (isNaN(page)) {
			page = 1;
		}
	}

	//
	let isDiscoverMode = false;

	if (typeof req.query.viewmode !== 'undefined'
        && req.query.viewmode.toLowerCase() === 'discover') {
		isDiscoverMode = true;
	}

	const userId = -1;
	const filterUserId = 1;
	const sort = getPostSort(req);

	const posts = await getPosts(
		userId,
		'UTC',
		page,
		isDiscoverMode,
		filterUserId,
		sort);

	//
	const rows2 = [];

	for (const post of posts) {
		rows2.push({
			post_id: post.public_id,
			title: post.is_visible ? post.title : false,
			link: post.is_visible ? post.link : false,
			post_time: post.created_on_raw,
			by: post.username,
			num_comments: post.num_comments,
			groups: post.tags,
		});
	}

	res.json(rows2);
};
