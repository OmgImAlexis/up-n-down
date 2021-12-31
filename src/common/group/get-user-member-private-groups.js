import sql from 'sql-tag';
import { query } from '../../db.js';

export const getUserMemberPrivateGroups = userId => query(sql`
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

