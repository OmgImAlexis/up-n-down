import { query } from '../../db.js';
import { sql } from '../sql-tag.js';

export const createGroupMember = (groupId: string, userId: number) => query<void>(sql('create-group-member')`
    INSERT INTO groupmember (private_group_id, user_id)
        VALUES (${groupId}, ${userId})
`).then(({ rows }) => rows);
