import sql from 'sql-tag';
import { query } from '../../db.js';

/**
 * Get a user from the database based on it's user_id
 * @param {string} userId
 * @returns
 */
export const getUserWithUserId = userId => query(sql`
    SELECT
        username,
        password
    FROM
        "user"
    WHERE
        user_id = ${userId}
`).then(({ rows }) => rows[0]);
