import postgres from 'postgresql-tag';
import { query } from '../../db/index.js';

/**
 * 
 * @param {string} userId The user's ID.
 * @param {import('../typedefs/settings.js').Settings} settings 
 * @returns 
 */
export const updateUser = (userId, settings) => query(postgres`
    UPDATE
        tuser
    SET
        time_zone = ${settings.timezone},
        post_mode = ${settings.postMode},
        comment_reply_mode = ${settings.commentReplyMode},
        eyes = ${settings.eyes},
        site_width = ${settings.siteWidth}
    WHERE
        user_id = ${userId}
`);

/**
 * 
 * @param {number} userId 
 * @param {string} username 
 * @returns 
 */
export const updateUserUsername = (userId, username) => query(postgres`
 UPDATE
     tuser
 SET
     username = ${username}
 WHERE
     user_id = ${userId}
`);