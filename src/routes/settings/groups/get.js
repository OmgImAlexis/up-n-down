import { getUserCreatedPrivateGroups } from '../../../common/group/get-user-created-private-groups.js';
import { getUserMemberPrivateGroups } from '../../../common/group/get-user-member-private-groups.js';

export const getSettingsGroups = async (req, res) => {
	const createdGroups = await getUserCreatedPrivateGroups(req.session.user.user_id);
	const memberGroups = await getUserMemberPrivateGroups(req.session.user.user_id);

	res.render('my-settings-groups', {
		html: {
			title: 'Settings/Groups',
		},
		createdGroups,
		memberGroups,
	});
};
