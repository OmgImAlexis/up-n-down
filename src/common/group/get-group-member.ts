import { query } from '../../db.js';
import { sql } from '../sql-tag.js';

export const getGroupMember = (groupId: string, userId: number) => query<{ group_member_id: number; }>(sql('get-group-member')`
    SELECT
        group_member_id
    FROM
        groupmember
    WHERE
        private_group_id = ${groupId} and
        user_id = ${userId}
`).then(({ rows: [groupMember] }) => groupMember);
