import { getPosts } from '../common/post/get-posts.js';
import { getPostSort } from '../common/get-post-sort.js';
import { isDiscover } from '../common/is-discover.js';
import { getCurrentTimezone } from '../common/get-current-timezone.js';
import { getCurrentEyesId } from '../common/get-current-eyes-id.js';

export const home = async (req, res) => {
    const userId = req.session.user?.user_id ?? -1;
    const requestedPage = parseInt(req.query.p, 10);
    const page = isNaN(requestedPage) ? 1 : requestedPage;
    const sort = getPostSort(req);
    
    const isDiscoverMode = isDiscover(req);
    const filterUserId = await getCurrentEyesId(req);

    const { rows: posts } = await getPosts(userId, getCurrentTimezone(req), page, isDiscoverMode, filterUserId, sort);

    res.render('posts2', {
        title: "Peaches 'n' Stink",
        posts,
        page,
        base_url: '/',
        is_discover_mode: isDiscoverMode,
        sort
    });
};
