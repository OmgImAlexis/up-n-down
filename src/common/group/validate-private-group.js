import { processPostTags } from '../post/process-post-tags.js';
import { getPrivateGroupWithName } from './get-private-group-with-name.js';
import { getTag } from '../tag/get-tag.js';

export const validatePrivateGroup = async (groupTag) => {
    const [groupName] = processPostTags(groupTag);

    // Require groups to have a name
    if (!groupName) throw new Error('Please enter a group name');
    if (!groupName.startsWith('p-')) throw new Error('Private group names must start with "p-", e.g. "p-frogs"');

    // Don't allow groups to be claimed twice
    const group = await getPrivateGroupWithName(groupName);
    if (group) throw new Error('This private group has already been claimed');

    // Don't allow public tags to be claimed
    const tag = await getTag(groupName);
    if (tag) throw new Error('This group already has public posts');
}