import { query } from '../../db.js';
import { sql } from '../sql-tag.js';

export const isUserFollowing = (userId: number, followeeUserId: number) => query<1>(sql('is-user-following')`
    SELECT
        1
    FROM
        follower f
    WHERE
        f.user_id = ${userId}
        AND f.followee_user_id = ${followeeUserId}
`).then(({ rows: [row] }) => row === 1);
