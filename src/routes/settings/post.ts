import type { Request, Response } from 'express';
import { getTimezoneWithName } from '../../common/utils/get-timezone-with-name.js';
import { getUserWithUsername } from '../../common/user/get-user-with-username.js';
import { saveSettings } from '../../common/settings/save-settings.js';
import { getTimezones } from '../../common/utils/get-timezones.js';

const title = 'Settings';

const defaultSettings = {
	eyes: -1,
	commentReplyMode: 'quick', // Quick
	postMode: 'discover', // Discover
	siteWidth: 600,
	timezone: 'UTC',
};

/**
 * Progress user settings change.
 */
export const postSettings = async (request: Request, response: Response) => {
	const settings = {
		eyes: request.body.eyes || defaultSettings.eyes,
		commentReplyMode: request.body.comment_reply_mode || defaultSettings.commentReplyMode,
		postMode: request.body.post_mode || defaultSettings.postMode,
		siteWidth: request.body.site_width ? parseInt(request.body.site_width, 10) : defaultSettings.siteWidth,
		timezone: request.body.timezone || defaultSettings.timezone,
	};

	// Get timezones
	const timezones = await getTimezones();

	try {
		// Check timezone is valid
		const timezone = await getTimezoneWithName(settings.timezone);
		if (!timezone) {
			throw new Error('Unknown time zone, pick again');
		}

		// Check eyes is valid
		if (settings.eyes !== -1) {
			const eyesLookup = await getUserWithUsername(settings.eyes);
			if (!eyesLookup?.is_eyes) {
				throw new Error('bad following list');
			}
		}

		// Check site width is valid
		if (settings.siteWidth < 500 || settings.siteWidth > 1000) {
			throw new Error('site width must be between 500-1000, or left blank');
		}
	} catch (error) {
		const timezones = await getTimezones();

		// Render error page
		return response.render('settings', {
			html: {
				title,
			},
			site: {
				...response.locals.site,
				maxWidth: settings.siteWidth,
			},
			error,
			...settings,
			timezones,
		});
	}

	// Save settings
	await saveSettings(request, response, settings);

	// Render success page
	response.render('settings', {
		html: {
			title,
		},
		site: {
			...response.locals.site,
			maxWidth: settings.siteWidth,
		},
		...settings,
		timezones,
	});
};
