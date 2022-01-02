import { query } from '../../db.js';
import { sql } from '../sql-tag.js';

export const getUserWithUsername = (username: string) => query<{
    user_id: number;
    username: string;
    password: string;
    time_zone: string;
    post_mode: string;
    is_eyes: unknown;
    eyes: unknown;
    comment_reply_mode: string;
    site_width: number;
}>(sql('get-user-with-username')`
    SELECT
        user_id,
        username,
        "password",
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
