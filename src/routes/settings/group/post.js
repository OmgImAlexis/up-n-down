async (req, res) => {
	//
	if (req.session.user) {
		//
		const { rows: data1 } = await db.getPrivateGroupWithName(req.query.name);

		//
		if (data1.length) {
			//
			const privateGroup = data1[0];

			if (privateGroup.created_by == req.session.user.user_id) {
				// Start delete member
				const isDeleteMember = typeof req.body.deleteid !== 'undefined';

				if (isDeleteMember) {
					await db.deleteGroupMember(
						privateGroup.private_group_id,
						req.body.deleteid);

					return res.redirect(`/settings/group?name=${req.query.name}`);
				}
				// End delete member

				//
				const errors = [];
				let submittedUser = null;

				if (req.body.user === '') {
					errors.push({ msg: 'Please fill in a username' });
				}

				//
				if (!errors.length) {
					const { rows: data2 } = await db.getUserWithUsername(req.body.user);

					if (!data2.length) {
						errors.push({ msg: 'No such user' });
					} else {
						submittedUser = data2[0];
					}
				}

				//
				if (!errors.length) {
					if (submittedUser.user_id == req.session.user.user_id) {
						errors.push({ msg: 'You don\'t need to add yourself' });
					}
				}

				//
				if (!errors.length) {
					const { rows: data3 } = await db.getGroupMember(
						privateGroup.private_group_id,
						submittedUser.user_id);

					if (data3.length) {
						errors.push({ msg: 'User is already a member' });
					}
				}

				//
				if (errors.length) {
					renderHtml(req, res, errors, privateGroup.private_group_id);
				} else {
					await db.createGroupMember(
						privateGroup.private_group_id,
						submittedUser.user_id);

					renderHtml(
						req,
						res,
						[{ msg: 'User successfully added to private group' }],
						privateGroup.private_group_id);
				}
			} else {
				res.send('hello...');
			}
		} else {
			res.send('private group does not exist');
		}
	} else {
		res.send('please log in');
	}
};

//
async function renderHtml(req, res, errors, privateGroupId) {
	const { rows: groupMembers } = await db.getGroupMembers(privateGroupId);

	//
	res.render(
		'my-settings-group',
		{
			html_title: htmlTitle,
			user: req.session.user,
			max_width: myMisc.getCurrSiteMaxWidth(req),
			errors,
			group_members: groupMembers,
		});
}
