import type { Request, Response } from 'express';
import { getPrivateGroupWithName } from '../../../common/group/get-private-group-with-name.js';
import { deleteGroupMember } from '../../../common/group/delete-group-member.js';
import { getUserWithUsername } from '../../../common/user/get-user-with-username.js';
import { getGroupMembers } from '../../../common/group/get-group-members.js';
import { getGroupMember } from '../../../common/group/get-group-member.js';
import { createGroupMember } from '../../../common/group/create-group-member.js';

export const postSettingsGroup = async (request: Request, response: Response) => {
	if (!request.session.user) {
		return response.send('please log in');
	}

	const privateGroup = await getPrivateGroupWithName(request.query.name);

	if (!privateGroup) {
		return response.send('private group does not exist');
	}

	if (privateGroup.created_by !== request.session.user.user_id) {
		return response.send('hello...');
	}

	if (request.body.deleteid) {
		await deleteGroupMember(privateGroup.private_group_id, request.body.deleteid);
		return response.redirect(`/settings/group?name=${request.query.name}`);
	}

	//
	const errors = [];
	let submittedUser = null;

	if (request.body.user === '') {
		errors.push({ msg: 'Please fill in a username' });
	}

	//
	if (!errors.length) {
		const data2 = await getUserWithUsername(request.body.user);

		if (!data2) {
			errors.push({ msg: 'No such user' });
		} else {
			submittedUser = data2
		}
	}

	//
	if (!errors.length) {
		if (submittedUser.user_id === request.session.user.user_id) {
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
		renderHtml(request, response, errors, privateGroup.private_group_id);
	} else {
		await createGroupMember(
			privateGroup.private_group_id,
			submittedUser.user_id);

		renderHtml(
			request,
			response,
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
