import { getPrivateGroupWithName } from '../../../common/group/get-private-group-with-name.js';
import { getGroupMembers } from '../../../common/group/get-group-members.js';

export const getSettingsGroup = async (req, res) => {
    const privateGroup = await getPrivateGroupWithName(req.query.name)
    if (!privateGroup) return res.send('private group does not exist')
    if(!privateGroup.created_by == req.session.user.user_id) return res.send('hello...');

    const groupMembers = await getGroupMembers(privateGroup.private_group_id);

    res.render('my-settings-group', {
        html: {
            title: 'Group Settings'
        },
        groupMembers
    });
};