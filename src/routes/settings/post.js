import { getTimezoneWithName } from '../../common/get-timezone-with-name.js';
import { updateUser } from '../../common/user/update-user.js';
import { getUserWithUsername } from '../../common/get-user-with-username.js';
import { cookieMaxAge as maxAge } from '../../config/index.js';
import { saveSettings } from '../../common/save-settings.js';
import { getTimezones } from '../../common/get-timezones.js';

const title = 'Settings';

const defaultSettings = {
    siteWidth: 600
};

/**
 * Progress user settings change
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
export const postSettings = async (req, res) => {
    const settings = {
        commentReplyMode: req.body.comment_reply_mode,
        eyes: req.body.eyes,
        postMode: req.body.post_mode,
        siteWidth: parseInt(req.body.site_width, 10) || defaultSettings.siteWidth,
        timezone: req.body.timezone
    };

    try {
        // Check timezone is valid
        const timeZone = await getTimezoneWithName(settings.timezone);
        if (!timeZone) throw new Error('Unknown time zone, pick again');

        // Check eyes is valid
        if (settings.eyes) {
            const eyesLookup = await getUserWithUsername(settings.eyes);
            if (!eyesLookup?.is_eyes) throw new Error('bad following list');
        }

        // Check site width is valid
        if (siteWidth < 500 || siteWidth > 1000) throw new Error('site width must be between 500-1000, or left blank');
    } catch (error) {
        const timezones = await getTimezones();

        // Render error page
        return res.render('my-settings', {
            page: {
                title
            },
            error,
            ...settings
        });
    }

    // Save settings
    await saveSettings(req, res, req.session.user.user_id, settings);

    // Render success page
    res.render('my-settings', {
        page: {
            title
        },
        ...settings
    });
};