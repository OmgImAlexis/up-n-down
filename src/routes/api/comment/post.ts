import type { Request, Response } from 'express';
import { dirname, join as joinPath } from 'path';
import { fileURLToPath } from 'url';
import HttpErrors from 'http-errors';
import { compileFile } from 'pug';
import { getCommentWithPublicId } from '../../../common/comment/get-comment-with-public-id.js';
import { isUserAllowedToViewPost } from '../../../common/post/is-user-allowed-to-view-post.js';
import { processComment } from '../../../common/comment/process-comment.js';
import { createCommentComment } from '../../../common/comment/create-comment-comment.js';
import { increasePostNumberOfComments } from '../../../common/post/increase-post-number-of-comments.js';
import { getCurrentTimezone } from '../../../common/settings/get-current-timezone.js';
import { compileMarkdown } from '../../../common/compile-markdown.js';
import { pushToConnectedClientsFirehose } from '../../../common/firehose.js';

const { Unauthorized, NotFound, Forbidden } = HttpErrors;

const __dirname = dirname(fileURLToPath(import.meta.url));

export const postComment = async (request: Request, response: Response) => {
	// Bail if they're not authenticated
	if (!request.session.user) {
		throw new Unauthorized('You must be signed in to post comments.');
	}

	// Bail if the comment doesn't exist
	const comment = await getCommentWithPublicId(request.body.comment_id);
	if (!comment) {
		throw new NotFound('No comment found with that ID');
	}

	// Bail if they if they don't have permission
	const isAllowed = await isUserAllowedToViewPost(comment.private_group_ids, request.session.user.user_id);
	if (!isAllowed) {
		throw new Forbidden('You do not have permission to comment on this post');
	}

	// Trim the comment
	const trimmedComment = processComment(request.body.text_content);

	// Create the reply
	const reply = await createCommentComment({
		postId: comment.post_id,
		userId: request.session.user.user_id,
		content: trimmedComment,
		parentPath: comment.path,
		timezone: getCurrentTimezone(request),
	});

	// Increase number of comments on the associated post
	await increasePostNumberOfComments(comment.post_id);

	const data = {
		...reply,
		text_content: compileFile(joinPath(__dirname, '../../../views/bbCodesOnly.pug'))({ compileMarkdown, text: reply.text_content }),
		by: request.session.user.username,
	};

	// Push reply to firehose
	pushToConnectedClientsFirehose('comment', data);

	// Respond with comment
	response.json(data);
};
