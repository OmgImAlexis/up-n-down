import createRouter from 'express-promise-router';
import { eyesDefaultUsername } from '../../config/index.js';
import { updateUserViewMode } from '../../common/update-user-view-mode.js';
import { getTimeZones } from '../../common/get-timezones.js';
import { getUserWithUserId } from '../../common/get-user-with-user-id.js';
import { getAvailableEyes } from '../../common/get-available-eyes.js';

const router = createRouter();
const title = 'Settings'
const cookieMaxAge = 1000*60*60*24*365*10;

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

    const timeZones = await getTimeZones();
    const availableEyes = await getAvailableEyes();
    const currentEyes = await getCurrentEyes(req);

    res.render('my-settings', {
        title,
        timeZones,
        // time_zone: myMisc.getCurrTimeZone(req),
        availableEyes,
        currentEyes,
        // postMode: myMisc.getCurrPostMode(req),
        // commentReplyMode: myMisc.getCurrCommentReplyMode(req),
        // siteWidth: myMisc.getCurrSiteMaxWidth(req),
        // max_width: myMisc.getCurrSiteMaxWidth(req)
    });
};
