import { eyesDefaultUsername } from '../../config/index.js';
import { updateUserViewMode } from '../../common/user/update-user-view-mode.js';
import { getTimezones } from '../../common/get-timezones.js';
import { getUserWithUserId } from '../../common/user/get-user-with-user-id.js';
import { getAvailableEyes } from '../../common/get-available-eyes.js';
import { cookieMaxAge } from '../../config/index.js';
import { getCurrentTimezone } from '../../common/get-current-timezone.js';
import { getCurrentSiteMaxWidth } from '../../common/get-current-site-max-width.js';

/**
 * Get the current eyes
 * @param {import('express').Request} req 
 * @returns {Promise<string>}
 */
const getCurrentEyes = async (req) => {
    // If the user is logged in and there's eyes
    if (req.session.user?.eyes) return getUserWithUserId(req.session.user.eyes).then(user => user.username);
    
    // If the user is logged out
    if (!req.session.user) return req.cookies.eyes ?? eyesDefaultUsername;

    // If the user is logged in and no eyes
    return '';
};

/**
 * Render user settings page
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
export const getSettings = async (req, res) => {
    if (req.query.viewmode) {
        const viewMode = req.query.viewmode == 'discover' ? req.query.viewmode : 'following-only';

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

    res.render('my-settings', {
        html:{
            title: 'Settings'
        },
        timezones,
        timezone: getCurrentTimezone(req),
        availableEyes,
        currentEyes,
        // postMode: myMisc.getCurrPostMode(req),
        // commentReplyMode: myMisc.getCurrCommentReplyMode(req),
        siteWidth: getCurrentSiteMaxWidth(req)
    });
};
