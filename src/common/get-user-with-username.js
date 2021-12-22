import postgres from 'postgresql-tag';
import { query } from '../db/index.js';

export const getUserWithUsername = (username) => query(postgres`
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
        lower(username) = lower(${username})
`);
