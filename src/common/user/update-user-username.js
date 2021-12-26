import sql from 'sql-tag';
import { query } from '../../db/index.js';

/**
 *
 * @param {number} userId
 * @param {string} username
 * @returns
 */
export const updateUserUsername = (userId, username) => query(sql`
 UPDATE
     tuser
 SET
     username = ${username}
 WHERE
     user_id = ${userId}
`);
