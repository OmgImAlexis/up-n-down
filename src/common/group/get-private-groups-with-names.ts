import { query } from '../../db.js';
import { sql } from '../sql-tag.js';

export const getPrivateGroupsWithNames = (groupNames: string[]) => query(sql('get-private-groups-with-names')`
    SELECT
        private_group_id,
        created_by,
        name
    FROM
        privategroup
    WHERE
        name in(${groupNames.join()})
`).then(({ rows }) => rows);
