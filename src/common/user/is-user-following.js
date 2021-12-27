import sql from 'sql-tag';
import { query } from '../../db/index.js';

export const isUserFollowing = (userId, followeeUserId) => query(sql`
    SELECT
        1
    FROM
        follower f
    WHERE
        f.user_id = ${userId} and
        f.followee_user_id = ${followeeUserId}
`).then(({ rows: [row] }) => row);
