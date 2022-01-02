import { query } from '../../db.js';
import { sql } from '../sql-tag.js';

export const getUserFollowees = (userId: number) => query<{ user_id: number; username: string; public_id: string; }>(sql('get-user-followees')`
    SELECT
        u.user_id,
        u.username,
        u.public_id
    FROM
        follower f
        JOIN "user" u ON u.user_id = f.followee_user_id
    WHERE
        f.user_id = ${userId}
    ORDER BY
        lower(u.username)
`).then(({ rows }) => rows);
