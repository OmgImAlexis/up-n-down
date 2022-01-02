import type { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { getPostWithPublic } from '../../../common/post/get-post-with-public.js';
import { processPostTitle } from '../../../common/post/process-post-title.js';
import { processPostTags } from '../../../common/post/process-post-tags.js';
import { getPrivateGroupsWithNames } from '../../../common/group/get-private-groups-with-names.js';
import { getDomainNameId } from '../../../common/get-domain-name-id.js';
import { getDomainName } from '../../../common/utils/get-domain-name.js';
import { updatePost } from '../../../common/post/update-post.js';
import { deletePostTags } from '../../../common/post/delete-post-tags.js';
import { createPostTags } from '../../../common/post/create-post-tags.js';

export const postPostEdit = async (request: Request, response: Response) => {
	const postPublicId = request.params.postId;
	const post = await getPostWithPublic(postPublicId);
	if (!post) {
		throw new Error('Unknown post.');
	}

	if (post.user_id !== request.session.user?.user_id) {
		throw new Error('Permission denied!');
	}

	// Check body for validation errors
	const [validationError] = validationResult(request).array({ onlyFirstError: true });
	if (validationError) {
		return response.render('posts/new', {
			html: {
				title: `Edit ${postPublicId}`,
			},
			error: new Error(validationError.msg),
			title: request.body.title,
			link: request.body.link ?? '',
			textContent: request.body.text_content,
			tags: request.body.tags,
			submitLabel: 'Edit Post',
			heading: 'Edit Post',
		});
	}

	const title = processPostTitle(request.body.title);
	const tags = processPostTags(request.body.tags);

	// Start private group check
	const existingPrivateGroups = post.private_group_names;
	const editedPrivateGroups = [];

	if (tags.length > 0) {
		const dataGroups = await getPrivateGroupsWithNames(tags);

		for (const dataGroup of dataGroups) {
			editedPrivateGroups.push(dataGroup.name);
		}
	}

	// Make sure private groups are unchanged
	// check that the lengths are equal
	// and check that one is a subset of the other
	const isPrivateGroupsSame
        = existingPrivateGroups.length === editedPrivateGroups.length
        && existingPrivateGroups.every(v => editedPrivateGroups.includes(v));

	if (!isPrivateGroupsSame) {
		throw new Error('You cannot edit private groups');
	}
	// End private group check

	const domainNameId = request.body.link ? await getDomainNameId(getDomainName(request.body.link)) : null;

	await updatePost(post.post_id, title, request.body.text_content, request.body.link, domainNameId);

	// Delete tags for this post
	await deletePostTags(post.post_id);

	await createPostTags(tags, post.post_id);

	return response.redirect('/p/' + postPublicId);
};
