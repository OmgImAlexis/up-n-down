import type { Request, Response } from 'express';
import { updateUser } from '../user/update-user.js';
import { cookieMaxAge as maxAge } from '../../config.js';
import { SiteSettings } from 'src/types/site.js';

/**
 * Save the current user's settings
 * If the user is logged in we'll persist via the session and database.
 * If the user is logged out we'll persist via cookies.
 */
export const saveSettings = async (request: Request, response: Response, settings: SiteSettings) => {
	// Handle logged out users
	if (!request.session.user) {
		// Set cookies as the user doesn't have a session
		response.cookie('comment_mode', settings.commentReplyMode, { maxAge });
		response.cookie('eyes', settings.eyes, { maxAge });
		response.cookie('post_mode', settings.postMode, { maxAge });
		response.cookie('site_width', settings.siteWidth, { maxAge });
		response.cookie('time_zone', settings.timezone, { maxAge });
		return;
	}

	// Update database
	await updateUser(request.session.user.user_id, settings);

	// Update session
	request.session.user.comment_reply_mode = settings.commentReplyMode;
	request.session.user.eyes = settings.eyes;
	request.session.user.post_mode = settings.postMode;
	request.session.user.site_width = settings.siteWidth;
	request.session.user.time_zone = settings.timezone;
};
