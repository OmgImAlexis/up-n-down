import { query } from '../../db.js';
import { sql } from '../sql-tag.js';

export const removeFollower = (userId: number, followeeUserId: number) => query(sql('remove-followers')`
    DELETE FROM follower
    WHERE user_id = ${userId}
        AND followee_user_id = ${followeeUserId}
`);
