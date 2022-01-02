import type { Request, Response } from 'express';
import { getUserCreatedPrivateGroups } from '../../../common/group/get-user-created-private-groups.js';
import { getUserMemberPrivateGroups } from '../../../common/group/get-user-member-private-groups.js';
import { validatePrivateGroup } from '../../../common/group/validate-private-group.js';
import { createPrivateGroup } from '../../../common/group/create-private-group.js';

export const postSettingsGroups = async (request: Request, response: Response) => {
	try {
		await validatePrivateGroup(request.body.group);
		await createPrivateGroup(request.body.group, request.session.user.user_id);

		const createdGroups = await getUserCreatedPrivateGroups(request.session.user.user_id);
		const memberGroups = await getUserMemberPrivateGroups(request.session.user.user_id);

		response.render('my-settings-groups', {
			html: {
				title: 'Settings/Groups',
			},
			info: {
				message: 'Private group successfully created',
			},
			createdGroups,
			memberGroups,
		});
	} catch (error) {
		const createdGroups = await getUserCreatedPrivateGroups(request.session.user.user_id);
		const memberGroups = await getUserMemberPrivateGroups(request.session.user.user_id);

		response.render('my-settings-groups', {
			html: {
				title: 'Settings/Groups',
			},
			error,
			createdGroups,
			memberGroups,
		});
	}
};
