import { createTag } from '../tag/create-tag.js';
import { createPostTag } from '../tag/create-post-tag.js';
import { getTag } from '../tag/get-tag.js';

export const createPostTags = async (tags: string[], postId: string) => Promise.all(tags.map(async tagText => {
	const tagId = await getTag(tagText).then(tag => tag?.tag_id) ?? await createTag(tagText).then(tag => tag.tag_id);
	return createPostTag(tagId, postId);
}));
