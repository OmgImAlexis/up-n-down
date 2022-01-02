import type { Request, Response } from 'express';
import { getCurrentTimezone } from '../../common/settings/get-current-timezone.js';
import { isDiscover } from '../../common/is-discover.js';
import { getCurrentCommentReplyMode } from '../../common/settings/get-current-comment-reply-mode.js';
import { getCurrentEyesId } from '../../common/settings/get-current-eyes-id.js';
import { getPostWithPublic2 } from '../../common/post/get-post-with-public-2.js';
import { isUserAllowedToViewPost } from '../../common/post/is-user-allowed-to-view-post.js';
import { getPostComments } from '../../common/comment/get-post-comments.js';
import { processComment } from '../../common/comment/process-comment.js';
import { createPostComment } from '../../common/comment/create-post-comment.js';
import { commentsPerPage } from '../../config.js';
import { getPageNumber } from '../../common/get-page-number.js';

/**
 * Add a comment to this post.
 */
export const postPost = async (request: Request, response: Response) => {
	const postPublicId = request.params.postId;
	const userId = request.session.user?.user_id ?? -1;
	const filterUserId = await getCurrentEyesId(request);
	const post = await getPostWithPublic2(postPublicId, getCurrentTimezone(request), userId, filterUserId);

	try {
		// Bail if no post was found
		if (!post) {
			return response.send('not found');
		}

		// Render an error page if they're not allowed
		const isAllowed = await isUserAllowedToViewPost(post.private_group_ids, userId);
		if (!isAllowed) {
			throw new Error('This post is from a private group and you do not have access.');
		}

		// Process the comment
		const content = processComment(request.body.text_content);

		// Save the comment to the database
		const comment = await createPostComment(post.post_id, userId, content);

		// Redirect the user to the newly created comment
		const numComments = post.num_comments + 1;
		const pages = Math.ceil(numComments / commentsPerPage);
		const redirectUrl = (pages > 1) ? `/p/${postPublicId}?p=${pages}#${comment.public_id}` : `/p/${postPublicId}#${comment.public_id}`;
		return response.redirect(redirectUrl);
	} catch (error) {
		const page = getPageNumber(request);

		// Check if discover mode is enabled
		const isDiscoverModeEnabled = isDiscover(request);

		const comments = await getPostComments(post.post_id, getCurrentTimezone(request), userId, isDiscoverModeEnabled, filterUserId, page);

		// Set the title to depending on the user's permissions
		const title = post.is_visible ? post.title : 'Post #' + post.public_id;

		// Render error
		return response.render('posts/post', {
			title,
			post,
			comments,
			error,
			isDiscoverMode: isDiscoverModeEnabled,
			comment_reply_mode: getCurrentCommentReplyMode(request),
			page,
		});
	}
};

