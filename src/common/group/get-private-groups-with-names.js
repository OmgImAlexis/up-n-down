import sql from 'sql-tag';
import { query } from '../../db/index.js';

export const getPrivateGroupsWithNames = groupNames => query(sql`
    SELECT
        private_group_id,
        created_by,
        name
    FROM
        tprivategroup
    WHERE
        name in(${groupNames.join()})
`).then(({ rows }) => rows);
