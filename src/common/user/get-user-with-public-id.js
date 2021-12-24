import postgres from 'postgresql-tag';
import { query } from '../../db/index.js';

/**
 * 
 * @param {string} publicId 
 * @returns 
 */
export const getUserWithPublicId = (publicId) => query(postgres`
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
        tuser
    WHERE
        public_id = ${publicId}
`).then(({rows: [user]}) => user);
