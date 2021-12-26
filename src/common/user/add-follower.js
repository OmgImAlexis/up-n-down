import sql from 'sql-tag';
import { query } from '../../db/index.js';

/**
 *
 * @param {number} userId
 * @param {number} followeeUserId
 * @returns
 */
export const addFollower = (userId, followeeUserId) => query(sql`
    INSERT INTO tfollower
        (user_id, followee_user_id)
    VALUES
        (${userId}, ${followeeUserId})
`);
