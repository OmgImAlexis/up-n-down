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

export const postPostEdit = async (req, res) => {
	const postPublicId = req.params.postId;
	const post = await getPostWithPublic(postPublicId);
	if (!post) {
		throw new Error('Unknown post.');
	}

	if (post.user_id !== req.session.user.user_id) {
		throw new Error('Permission denied!');
	}

	// Check body for validation errors
	const [validationError] = validationResult(req).array({ onlyFirstError: true });
	if (validationError) {
		return res.render('posts/new', {
			html: {
				title: `Edit ${postPublicId}`,
			},
			error: new Error(validationError.msg),
			title: req.body.title,
			link: req.body.link ?? '',
			textContent: req.body.text_content,
			tags: req.body.tags,
			submitLabel: 'Edit Post',
			heading: 'Edit Post',
		});
	}

	const title = processPostTitle(req.body.title);
	const tags = processPostTags(req.body.tags);

	// Start private group check
	const existingPrivateGroups = post.private_group_names;
	const editedPrivateGroups = [];

	if (tags.length > 0) {
		const { rows: dataGroups } = await getPrivateGroupsWithNames(tags);

		for (let i = 0; i < dataGroups.length; ++i) {
			editedPrivateGroups.push(dataGroups[i].name);
		}
	}

	// Make sure private groups are unchanged
	// check that the lengths are equal
	// and check that one is a subset of the other
	const isPrivateGroupsSame
        = existingPrivateGroups.length == editedPrivateGroups.length
        && existingPrivateGroups.every(v => editedPrivateGroups.includes(v));

	if (!isPrivateGroupsSame) {
		throw new Error('You cannot edit private groups');
	}
	// End private group check

	const domainNameId = req.body.link ? await getDomainNameId(getDomainName(req.body.link)) : null;

	await updatePost(post.post_id, title, req.body.text_content, req.body.link, domainNameId);

	// Delete tags for this post
	await deletePostTags(post.post_id);

	//
	await createPostTags(tags, post.post_id);

	//
	return res.redirect('/p/' + postPublicId);
};
