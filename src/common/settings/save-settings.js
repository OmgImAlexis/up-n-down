import { updateUser } from '../user/update-user.js';
import { cookieMaxAge as maxAge } from '../../config.js';

/**
 * Save the current user's settings
 * If the user is logged in we'll persist via the session and database.
 * If the user is logged out we'll persist via cookies.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {string} userId
 * @param {import('./typedefs/settings.js').Settings} settings
 */
export const saveSettings = async (req, res, settings = {}) => {
	// Handle logged out users
	if (!req.session.user) {
		// Set cookies as the user doesn't have a session
		res.cookie('comment_mode', settings.commentReplyMode, { maxAge });
		res.cookie('eyes', settings.eyes, { maxAge });
		res.cookie('post_mode', settings.postMode, { maxAge });
		res.cookie('site_width', settings.siteWidth, { maxAge });
		res.cookie('time_zone', settings.timezone, { maxAge });
		return;
	}

	// Update database
	await updateUser(req.session.user.user_id, settings);

	// Update session
	req.session.user.comment_reply_mode = settings.commentReplyMode;
	req.session.user.eyes = settings.eyes;
	req.session.user.post_mode = settings.postMode;
	req.session.user.site_width = settings.siteWidth;
	req.session.user.time_zone = settings.timezone;
};
