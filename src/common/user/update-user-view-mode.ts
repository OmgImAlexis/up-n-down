import sql from 'sql-tag';
import { query } from '../../db.js';

export const updateUserViewMode = async (userId, postMode) => query(sql`
    UPDATE
        "user"
    SET
        post_mode = ${postMode}
    WHERE
        user_id = ${userId}
`).then(({ rows }) => rows);
