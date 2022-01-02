import { query } from '../../db.js';
import { sql } from '../sql-tag.js';

export const addFollower = (userId: number, followeeUserId: number) => query<void>(sql('add-follower')`
    INSERT INTO follower (user_id, followee_user_id)
        VALUES (${userId}, ${followeeUserId})
`);
