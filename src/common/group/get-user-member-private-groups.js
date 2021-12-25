import sql from 'sql-tag';
import { query } from '../../db/index.js';

export const getUserMemberPrivateGroups = (userId) => query(sql`
    SELECT
        pg.name
    FROM
        tprivategroup pg
    JOIN
        tgroupmember gm on gm.private_group_id = pg.private_group_id
    WHERE
        gm.user_id = ${userId}
    ORDER BY
        pg.name
`).then(({ rows }) => rows);

