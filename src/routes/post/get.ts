import type { Request, Response } from 'express';
import { getCurrentTimezone } from '../../common/settings/get-current-timezone.js';
import { isDiscover } from '../../common/is-discover.js';
import { getCurrentCommentReplyMode } from '../../common/settings/get-current-comment-reply-mode.js';
import { getCurrentEyesId } from '../../common/settings/get-current-eyes-id.js';
import { getPostWithPublic2 } from '../../common/post/get-post-with-public-2.js';
import { isUserAllowedToViewPost } from '../../common/post/is-user-allowed-to-view-post.js';
import { getPostComments } from '../../common/comment/get-post-comments.js';
import { getPageNumber } from '../../common/get-page-number.js';

const isUUID = (text: string) => /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(text);

/**
 * Render a post.
 */
export const getPost = async (request: Request, response: Response) => {
	const postPublicId = request.params.postId;
	const userId = request.session.user.user_id ?? -1;
	const filterUserId = await getCurrentEyesId(request);

	// Bail if this isn't a UUID
	if (!isUUID(postPublicId)) {
		throw new Error('Invalid post ID');
	}

	// Fetch the current post
	const post = await getPostWithPublic2(postPublicId, getCurrentTimezone(request), userId, filterUserId);

	// Bail if we didn't get a post back
	if (!post) {
		return response.send('not found');
	}

	// Render an error page if they're not allowed
	const isAllowed = await isUserAllowedToViewPost(post.private_group_ids, userId);
	if (!isAllowed) {
		return response.render('message', {
			title: 'Post #' + post.public_id,
			message: 'This post is from a private group and you do not have access.',
		});
	}

	const page = getPageNumber(request);

	// Check if discover mode is enabled
	const isDiscoverModeEnabled = isDiscover(request);

	// Get the comments for this post
	const comments = await getPostComments(post.post_id, getCurrentTimezone(request), userId, isDiscoverModeEnabled, filterUserId, page);

	// Set the title to depending on the user's permissions
	const title = post.is_visible ? post.title : 'Post #' + post.public_id;

	// Render the post
	response.render('posts/post', {
		html: {
			title,
		},
		title,
		post,
		comments,
		comment_reply_mode: getCurrentCommentReplyMode(request),
		isDiscoverMode: isDiscoverModeEnabled,
		page,
	});
};
