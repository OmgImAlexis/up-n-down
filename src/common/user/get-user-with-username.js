import sql from 'sql-tag';
import { query } from '../../db.js';

/**
 *
 * @param {string} username
 * @returns
 */
export const getUserWithUsername = username => query(sql`
    SELECT
        user_id,
        username,
        password,
        time_zone,
        post_mode,
        is_eyes,
        eyes,
        comment_reply_mode,
        site_width
    FROM
        "user"
    WHERE
        lower(username) = lower(${username})
`).then(({ rows: [user] }) => user);
