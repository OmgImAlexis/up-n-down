import postgres from 'postgresql-tag';
import { query } from '../../db/index.js';

/**
 * Get a user from the database based on it's user_id
 * @param {string} userId 
 * @returns 
 */
export const getUserWithUserId = (userId) => query(postgres`
    SELECT
        username,
        password
    FROM
        tuser
    WHERE
        user_id = ${userId}
`).then(({ rows }) => rows[0]);
