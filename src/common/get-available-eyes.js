import sql from 'sql-tag';
import { query } from '../db/index.js';

/**
 *
 * @returns {string} username
 */
export const getAvailableEyes = () => query(sql`
    SELECT username FROM "user" WHERE is_eyes
    ORDER BY lower(username)
`).then(({ rows: [eyes] }) => eyes);
