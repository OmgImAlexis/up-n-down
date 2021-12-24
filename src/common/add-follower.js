import postgres from 'postgresql-tag';
import { query } from '../db/index.js';

/**
 * 
 * @param {number} userId 
 * @param {number} followeeUserId 
 * @returns 
 */
export const addFollower = (userId, followeeUserId) => query(postgres`
    INSERT INTO tfollower
        (user_id, followee_user_id)
    VALUES
        (${userId}, ${followeeUserId})
`);
