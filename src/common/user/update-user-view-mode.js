import sql from 'sql-tag';
import { query } from '../../db.js';

export const updateUserViewMode = async (userId, postMode) => query(sql`
    update
        "user"
    set
        post_mode = ${postMode}
    where
        user_id = ${userId}
`).then(({ rows }) => rows);
