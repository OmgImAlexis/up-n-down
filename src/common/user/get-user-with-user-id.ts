import { query } from '../../db.js';
import { sql } from '../sql-tag.js';

/**
 * Get a user from the database based on it's user_id
 */
export const getUserWithUserId = (userId: number) => query<{ username: string; password: string; }>(sql('get-user-with-user-id')`
    SELECT
        "username",
        "password"
    FROM
        "user"
    WHERE
        user_id = ${userId}
`).then(({ rows }) => rows[0]);
