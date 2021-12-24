import postgres from 'postgresql-tag';
import { query } from '../../db/index.js';

/**
 * 
 * @param {string} userId 
 * @returns 
 */
export const getUserFollowees = (userId) => query(postgres`
    SELECT
        u.user_id,
        u.username,
        u.public_id
    FROM
        tfollower f
    JOIN
        tuser u on u.user_id = f.followee_user_id
    WHERE
        f.user_id = ${userId}
    ORDER BY
        lower(u.username)
`).then(({ rows }) => rows);
