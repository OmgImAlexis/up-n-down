import type { Request } from 'express';

/**
 * Get the current comment reply mode for this request
 */
export const getCurrentCommentReplyMode = (request: Request) => {
	const defaultReplyMode = 'quick';
	if (request.session.user) {
		return request.session.user.comment_reply_mode ?? defaultReplyMode;
	}

	return defaultReplyMode;
};
