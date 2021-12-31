import sql from 'sql-tag';
import { query } from '../../db.js';

/**
 *
 * @param {string} userId The user's ID.
 * @param {import('../typedefs/settings.js').Settings} settings
 * @returns
 */
export const updateUser = (userId, settings) => query(sql`
    UPDATE
        "user"
    SET
        time_zone = ${settings.timezone},
        post_mode = ${settings.postMode},
        comment_reply_mode = ${settings.commentReplyMode},
        eyes = ${settings.eyes},
        site_width = ${settings.siteWidth}
    WHERE
        user_id = ${userId}
`);
