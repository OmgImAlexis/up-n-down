import postgres from 'postgresql-tag';
import { query } from '../../db/index.js';

export const updateUserViewMode = async (userId, postMode) => query(postgres`
    update
        tuser
    set
        post_mode = ${postMode}
    where
        user_id = ${userId}
`).then(({ rows }) => rows);
