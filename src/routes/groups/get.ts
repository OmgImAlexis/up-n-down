import type { Request, Response } from 'express';
import { getPrivateGroupWithName } from '../../common/group/get-private-group-with-name.js';
import { getUserAllPrivateGroupIds } from '../../common/get-user-all-private-group-ids.js';
import { getPostSort } from '../../common/post/get-post-sort.js';
import { isDiscover } from '../../common/is-discover.js';
import { getCurrentEyesId } from '../../common/settings/get-current-eyes-id.js';
import { getCurrentTimezone } from '../../common/settings/get-current-timezone.js';
import { getTagPosts } from '../../common/get-tag-posts.js';
import { getPageNumber } from '../../common/get-page-number.js';

export const getGroups = async (request: Request, response: Response) => {
	const groupName = request.params.groupId;
	const finalUserId = request.session.user ? request.session.user.user_id : -1;

	const page = getPageNumber(request);
	const privateGroup = await getPrivateGroupWithName(groupName);

	if (privateGroup) {
		const ids = request.session.user ? await getUserAllPrivateGroupIds(request.session.user.user_id) : [];
		const isAllowed = ids.includes(privateGroup.private_group_id);
		if (!isAllowed) {
			return response.render('message', {
				title: groupName,
				message: 'This group is private and you do not have access.',
			});
		}
	}

	const sort = getPostSort(request);
	const isDiscoverMode = isDiscover(request);
	const filterUserId = await getCurrentEyesId(request);

	const posts = await getTagPosts(finalUserId, {
		timezone: getCurrentTimezone(request),
		page,
		tag: groupName,
		is_discover_mode: isDiscoverMode,
		filter_user_id: filterUserId,
		sort,
	});

	response.render('posts/feed', {
		html: {
			title: groupName,
		},
		posts,
		page,
		baseUrl: `/g/${groupName}`,
		isDiscoverMode,
		groupName,
		sort,
	});
};
