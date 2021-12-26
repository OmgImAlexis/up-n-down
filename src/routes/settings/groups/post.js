import { getUserCreatedPrivateGroups } from '../../../common/group/get-user-created-private-groups.js';
import { getUserMemberPrivateGroups } from '../../../common/group/get-user-member-private-groups.js';
import { validatePrivateGroup } from '../../../common/group/validate-private-group.js';
import { createPrivateGroup } from '../../../common/group/create-private-group.js';

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const postSettingsGroups = async (req, res) => {
	try {
		await validatePrivateGroup(req.body.group);
		await createPrivateGroup(req.body.group, req.session.user.user_id);

		const createdGroups = await getUserCreatedPrivateGroups(req.session.user.user_id);
		const memberGroups = await getUserMemberPrivateGroups(req.session.user.user_id);

		res.render('my-settings-groups', {
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
		const createdGroups = await getUserCreatedPrivateGroups(req.session.user.user_id);
		const memberGroups = await getUserMemberPrivateGroups(req.session.user.user_id);

		res.render('my-settings-groups', {
			html: {
				title: 'Settings/Groups',
			},
			error,
			createdGroups,
			memberGroups,
		});
	}
};
