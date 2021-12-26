import sql from 'sql-tag';
import { query } from '../../db/index.js';

/**
 *
 * @param {number} userId
 * @param {number} followeeUserId
 * @returns
 */
export const removeFollower = (userId, followeeUserId) => query(sql`
    DELETE FROM
        tfollower
    WHERE
        user_id = ${userId} and
        followee_user_id = ${followeeUserId}
`);
