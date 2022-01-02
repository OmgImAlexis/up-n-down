import { query } from '../../db.js';
import { sql } from '../sql-tag.js';

export const updateUserUsername = (userId: number, username: string) => query<void>(sql('update-user-username')`
    UPDATE
        "user"
    SET
        username = ${username}
    WHERE
        user_id = ${userId}
`);
