import postgres from 'postgresql-tag';
import { query } from '../../db/index.js';

export const isUserFollowing = (userId, followeeUserId) => query(postgres`
    SELECT
        1
    FROM
        tfollower f
    WHERE
        f.user_id = ${userId} and
        f.followee_user_id = ${followeeUserId}
`).then(({ rows: [row] }) => row);
