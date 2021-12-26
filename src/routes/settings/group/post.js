import { getPrivateGroupWithName } from '../../../common/group/get-private-group-with-name.js';
import { deleteGroupMember } from '../../../common/group/delete-group-member.js';
import { getUserWithUsername } from '../../../common/user/get-user-with-username.js';
import { getGroupMembers } from '../../../common/group/get-group-members.js';
import { getGroupMember } from '../../../common/group/get-group-member.js';
import { createGroupMember } from '../../../common/group/create-group-member.js';

export const postSettingsGroup = async (req, res) => {
	if (!req.session.user) {
		return res.send('please log in');
	}

	const privateGroup = await getPrivateGroupWithName(req.query.name);

	if (!privateGroup) {
		return res.send('private group does not exist');
	}

	if (privateGroup.created_by !== req.session.user.user_id) {
		return res.send('hello...');
	}

	if (req.body.deleteid) {
		await deleteGroupMember(privateGroup.private_group_id, req.body.deleteid);
		return res.redirect(`/settings/group?name=${req.query.name}`);
	}

	//
	const errors = [];
	let submittedUser = null;

	if (req.body.user === '') {
		errors.push({ msg: 'Please fill in a username' });
	}

	//
	if (!errors.length) {
		const { rows: data2 } = await getUserWithUsername(req.body.user);

		if (data2.length === 0) {
			errors.push({ msg: 'No such user' });
		} else {
			submittedUser = data2[0];
		}
	}

	//
	if (!errors.length) {
		if (submittedUser.user_id === req.session.user.user_id) {
			errors.push({ msg: 'You don\'t need to add yourself' });
		}
	}

	//
	if (!errors.length) {
		const groupMember = await getGroupMember(
			privateGroup.private_group_id,
			submittedUser.user_id);

		if (groupMember) {
			errors.push({ msg: 'User is already a member' });
		}
	}

	//
	if (errors.length) {
		renderHtml(req, res, errors, privateGroup.private_group_id);
	} else {
		await createGroupMember(
			privateGroup.private_group_id,
			submittedUser.user_id);

		renderHtml(
			req,
			res,
			[{ msg: 'User successfully added to private group' }],
			privateGroup.private_group_id);
	}
};

//
async function renderHtml(req, res, errors, privateGroupId) {
	const groupMembers = await getGroupMembers(privateGroupId);

	res.render('my-settings-group', {
		html: {
			title: 'Settings Group',
		},
		errors,
		groupMembers,
	});
}
