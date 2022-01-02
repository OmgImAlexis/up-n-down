import { query } from '../../db.js';
import { sql } from '../sql-tag.js';

export const getUserMemberPrivateGroups = (userId: string) => query(sql('get-user-member-private-groups')`
    SELECT
        pg.name
    FROM
        privategroup pg
    JOIN
        groupmember gm on gm.private_group_id = pg.private_group_id
    WHERE
        gm.user_id = ${userId}
    ORDER BY
        pg.name
`).then(({ rows }) => rows);

