import { getPrivateGroupWithName } from '../../common/group/get-private-group-with-name.js';
import { getUserAllPrivateGroupIds } from '../../common/get-user-all-private-group-ids.js';
import { getPostSort } from '../../common/post/get-post-sort.js';
import { isDiscover } from '../../common/is-discover.js';
import { getCurrentEyesId } from '../../common/settings/get-current-eyes-id.js';
import { getCurrentTimezone } from '../../common/settings/get-current-timezone.js';
import { getTagPosts } from '../../common/get-tag-posts.js';

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @returns 
 */
export const getGroups = async (req, res) => {
    const tag = req.params.groupId;
    let finalUserId = req.session.user ? req.session.user.user_id : -1

    //
    let page = 1

    if(typeof req.query.p !== 'undefined') {
        page = parseInt(req.query.p)

        if(isNaN(page)) {
            return res.redirect(`/g/${tag}`)
        }
    }

    //
    const privateGroup = await getPrivateGroupWithName(tag);

    if (privateGroup) {
        const ids = req.session.user ? await getUserAllPrivateGroupIds(req.session.user.user_id) : [];
        const isAllowed = ids.includes(privateGroup.private_group_id);
        if(!isAllowed) {
            return res.render('message', {
                title: tag,
                message: "This group is private and you do not have access."
            });
        }
    }

    //
    const sort = getPostSort(req);

    //
    const isDiscoverMode = isDiscover(req);
    const filterUserId = await getCurrentEyesId(req);

    //
    const posts = await getTagPosts(
        finalUserId,
        getCurrentTimezone(req),
        page,
        tag,
        isDiscoverMode,
        filterUserId,
        sort);

    res.render('posts/feed', {
        html: {
            title: tag
        },
        posts,
        page,
        base_url: `/g/${tag}`,
        is_discover_mode: isDiscoverMode,
        page_tag: tag,
        sort
    });
}