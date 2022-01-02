import { query } from '../../db.js';
import { sql } from '../sql-tag.js';

export const getGroupMembers = (groupId: string) => query<{ public_id: string; username: string; }>(sql('get-group-members')`
    SELECT
        u.public_id,
        u.username
    FROM
        "user" u
    JOIN
        groupmember gm on gm.user_id = u.user_id
    WHERE
        gm.private_group_id = ${groupId}
    ORDER BY
        u.username
`).then(({ rows }) => rows);
