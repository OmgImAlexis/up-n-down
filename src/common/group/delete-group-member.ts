import { query } from '../../db.js';
import { sql } from '../sql-tag.js';

export const deleteGroupMember = (privateGroupId: string, publicUserId: string) => query<void>(sql('delete-group-member')`
    DELETE FROM groupmember gm USING "user" u
    WHERE u.public_id = ${publicUserId}
        AND gm.private_group_id = ${privateGroupId}
        AND u.user_id = gm.user_id
`).then(({ rows }) => rows);
