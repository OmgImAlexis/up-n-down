import type { Request, Response } from 'express';
import { getUserCreatedPrivateGroups } from '../../../common/group/get-user-created-private-groups.js';
import { getUserMemberPrivateGroups } from '../../../common/group/get-user-member-private-groups.js';

export const getSettingsGroups = async (request: Request, response: Response) => {
	const createdGroups = await getUserCreatedPrivateGroups(request.session.user.user_id);
	const memberGroups = await getUserMemberPrivateGroups(request.session.user.user_id);

	response.render('my-settings-groups', {
		html: {
			title: 'Settings/Groups',
		},
		createdGroups,
		memberGroups,
	});
};
