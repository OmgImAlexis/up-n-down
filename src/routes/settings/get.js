import { eyesDefaultUsername } from '../../config/index.js';
import { updateUserViewMode } from '../../common/user/update-user-view-mode.js';
import { getTimezones } from '../../common/utils/get-timezones.js';
import { getUserWithUserId } from '../../common/user/get-user-with-user-id.js';
import { getAvailableEyes } from '../../common/get-available-eyes.js';
import { cookieMaxAge } from '../../config/index.js';
import { getCurrentTimezone } from '../../common/settings/get-current-timezone.js';
import { getCurrentSiteMaxWidth } from '../../common/settings/get-current-site-max-width.js';
import { getCurrentPostMode } from '../../common/settings/get-current-post-mode.js';
import { getCurrentCommentReplyMode } from '../../common/settings/get-current-comment-reply-mode.js';

/**
 * Get the current eyes
 * @param {import('express').Request} req
 * @returns {Promise<string>}
 */
const getCurrentEyes = async req =>
// // If the user is logged out
// if (!req.session.user) return req.cookies.eyes ?? eyesDefaultUsername;

// // If the user is logged in and there's eyes
// if (req.session.user?.eyes) return getUserWithUserId(req.session.user.eyes).then(user => user.username);

// // If the user is logged in and no eyes
// return '';
	eyesDefaultUsername;
const viewModes = ['discover', 'following-only'];

/**
 * Render user settings page
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getSettings = async (req, res) => {
	if (req.query.viewmode) {
		// Default to discover mode
		const viewMode = viewModes.includes(req.query.viewmode) ? req.query.viewmode : 'discover';

		// Either update the session or cookie
		// depending on if the user is logged in
		if (req.session.user) {
			await updateUserViewMode(req.session.user.user_id, viewMode);
			req.session.user.post_mode = viewMode;
		} else {
			res.cookie('post_mode', viewMode, { maxAge: cookieMaxAge });
		}

		const redirectUrl = req.query.goto ?? '/settings';
		return res.redirect(redirectUrl);
	}

	const timezones = await getTimezones();
	const availableEyes = await getAvailableEyes();
	const currentEyes = await getCurrentEyes(req);

	res.render('settings', {
		html: {
			title: 'Settings',
		},
		timezones,
		timezone: getCurrentTimezone(req),
		availableEyes,
		currentEyes,
		postMode: getCurrentPostMode(req),
		commentReplyMode: getCurrentCommentReplyMode(req),
		siteWidth: getCurrentSiteMaxWidth(req),
	});
};
