import { processPostTags } from '../post/process-post-tags.js';
import { getPrivateGroupWithName } from './get-private-group-with-name.js';
import { getTag } from '../tag/get-tag.js';

export const validatePrivateGroup = async (groupTag: string) => {
	const [groupName] = processPostTags(groupTag);

	// Require groups to have a name
	if (!groupName) {
		throw new Error('Please enter a group name');
	}

	// Don't allow groups to be claimed twice
	const group = await getPrivateGroupWithName(groupName);
	if (group) {
		throw new Error('This private group has already been claimed');
	}

	// Don't allow public tags to be claimed
	// @todo: split groups and tags
	const tag = await getTag(groupName);
	if (tag) {
		throw new Error('This group already has public posts');
	}
};
