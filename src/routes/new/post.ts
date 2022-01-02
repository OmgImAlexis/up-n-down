import type { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { processPostTitle } from '../../common/post/process-post-title.js';
import { getDomainName } from '../../common/utils/get-domain-name.js';
import { processPostTags } from '../../common/post/process-post-tags.js';
import { createPost } from '../../common/post/create-post.js';
import { getDomainNameId } from '../../common/get-domain-name-id.js';
import { createPostTags } from '../../common/post/create-post-tags.js';
import { getPrivateGroupsWithNames } from '../../common/group/get-private-groups-with-names.js';
import { getGroupMember } from '../../common/group/get-group-member.js';

const title = 'New Post';

/**
 * Process new post form.
 */
export const postNew = async (request: Request, response: Response) => {
	try {
		if (!request.session.user) {
			throw new Error('You must be logged in to create posts.');
		}

		const [validationError] = validationResult(request).array({ onlyFirstError: true });
		if (validationError) {
			throw new Error(validationError.msg);
		}

		// Process title
		const title = processPostTitle(request.body.title);

		// Process tags
		const tags = processPostTags(request.body.tags);

		// Check the user has permission to post in this private group
		if (tags.length > 0) {
			const privateGroups = await getPrivateGroupsWithNames(tags);

			for await (const privateGroup of privateGroups) {
				// If this is not the owner then check they're a member of the group
				if (request.session.user.user_id !== privateGroup.created_by) {
					const groupMember = await getGroupMember(privateGroup.private_group_id, request.session.user.user_id);
					if (!groupMember) {
						throw new Error('You used a private group you don\'t have access to');
					}
				}
			}
		}

		// Get the domain name ID
		const domainNameId = request.body.link ? await getDomainNameId(getDomainName(request.body.link)) : null;

		// Create the post
		const { postId, publicId } = await createPost(
			request.session.user.user_id,
			title,
			request.body.text_content,
			request.body.link,
			domainNameId,
		);

		// Create post tags
		// This should be moved to createPost
		// There's no need for this to be separate
		await createPostTags(tags, postId);

		// Send the user to the newly created post
		return response.redirect(`/p/${publicId}`);
	} catch (error) {
		response.render('posts/new', {
			html: {
				title,
			},
			error,
			title: request.body.title,
			link: request.body.link,
			textContent: request.body.text_content,
			tags: request.body.tags,
			submitLabel: 'Create Post',
			heading: 'New Post',
		});
	}
};
