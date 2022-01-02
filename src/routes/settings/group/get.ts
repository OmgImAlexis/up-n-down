import type { Request, Response } from 'express';
import { getPrivateGroupWithName } from '../../../common/group/get-private-group-with-name.js';
import { getGroupMembers } from '../../../common/group/get-group-members.js';

export const getSettingsGroup = async (request: Request, response: Response) => {
	const privateGroup = await getPrivateGroupWithName(request.query.name);
	if (!privateGroup) {
		return response.send('private group does not exist');
	}

	if (!privateGroup.created_by === request.session.user.user_id) {
		return response.send('hello...');
	}

	const groupMembers = await getGroupMembers(privateGroup.private_group_id);

	response.render('my-settings-group', {
		html: {
			title: 'Group Settings',
		},
		groupMembers,
	});
};
