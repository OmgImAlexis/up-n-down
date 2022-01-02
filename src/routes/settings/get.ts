import type { Request, Response } from 'express';
import { eyesDefaultUsername } from '../../config.js';
import { updateUserViewMode } from '../../common/user/update-user-view-mode.js';
import { getTimezones } from '../../common/utils/get-timezones.js';
import { getUserWithUserId } from '../../common/user/get-user-with-user-id.js';
import { getAvailableEyes } from '../../common/get-available-eyes.js';
import { cookieMaxAge } from '../../config.js';
import { getCurrentTimezone } from '../../common/settings/get-current-timezone.js';
import { getCurrentPostMode } from '../../common/settings/get-current-post-mode.js';
import { getCurrentCommentReplyMode } from '../../common/settings/get-current-comment-reply-mode.js';
import { getCurrentSiteMaxWidth } from '../../common/settings/get-current-site-max-width.js';

/**
 * Get the current eyes.
 */
const getCurrentEyes = async (request: Request) => {
	// If the user is logged out
	if (!request.session.user) {
		return request.cookies.eyes ?? eyesDefaultUsername;
	}

	// If the user is logged in and there's eyes
	if (request.session.user?.eyes) {
		return getUserWithUserId(request.session.user.eyes).then(user => user?.username);
	}

	// If the user is logged in and no eyes
	return '';
};

const viewModes = ['discover', 'following-only'];

/**
 * Render user settings page.
 */
export const getSettings = async (request: Request, response: Response) => {
	if (request.query.viewmode) {
		// Default to discover mode
		const viewMode = viewModes.includes(request.query.viewmode as string) ? request.query.viewmode as string : 'discover';

		// Either update the session or cookie
		// depending on if the user is logged in
		if (request.session.user) {
			await updateUserViewMode(request.session.user.user_id, viewMode);
			request.session.user.post_mode = viewMode;
		} else {
			response.cookie('post_mode', viewMode, { maxAge: cookieMaxAge });
		}

		const redirectUrl = request.query.goto as string ?? '/settings';
		return response.redirect(redirectUrl);
	}

	const timezones = await getTimezones();
	const availableEyes = getAvailableEyes();
	const currentEyes = await getCurrentEyes(request);
	const siteWidth = getCurrentSiteMaxWidth(request);

	response.render('settings', {
		html: {
			title: 'Settings',
		},
		site: {
			...response.locals.site,
			maxWidth: siteWidth,
		},
		timezones,
		timezone: getCurrentTimezone(request),
		availableEyes,
		currentEyes,
		postMode: getCurrentPostMode(request),
		commentReplyMode: getCurrentCommentReplyMode(request),
		siteWidth,
	});
};
