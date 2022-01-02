import type { Request, Response } from 'express';
import { getPostWithPublic } from '../../../common/post/get-post-with-public.js';

/**
 * Render the edit page for a post.
 */
export const getPostEdit = async (request: Request, response: Response) => {
	const postPublicId = request.params.postId;
	const post = await getPostWithPublic(postPublicId);
	if (!post) {
		throw new Error('Unknown post.');
	}

	if (post.user_id !== request.session.user?.user_id) {
		throw new Error('Permission denied!');
	}

	// Render post edit page
	response.render('posts/new', {
		html: {
			title: 'Edit Post',
		},
		title: post.title,
		link: post.link || '',
		textContent: post.text_content,
		tags: post.tags.join(', '),
		submitLabel: 'Edit Post',
		heading: 'Edit Post',
	});
};
