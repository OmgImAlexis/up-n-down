import { createTag } from '../tag/create-tag.js';
import { createPostTag } from '../tag/create-post-tag.js';
import { getTag } from '../tag/get-tag.js';

/**
 *
 * @param {string[]} tags
 * @param {string} postId
 * @returns
 */
export const createPostTags = async (tags, postId) => Promise.all(tags.map(async tagText => {
	const tag = await getTag(tagText).then(tag => tag?.tag_id) ?? await createTag(tagText).then(tag => tag.tag_id);
	return createPostTag(tag.tag_id, postId);
}));
