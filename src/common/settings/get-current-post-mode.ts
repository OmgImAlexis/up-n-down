import type Express from 'express';

/**
 * Get the current post mode for this request
 */
export const getCurrentPostMode = (request: Express.Request) => {
	if (request.session.user) {
		return request.session.user.post_mode ?? 'discover';
	}

	return request.cookies.post_mode ?? 'discover';
};
