import { query } from '../../db.js';
import { sql } from '../sql-tag.js';

export const getPrivateGroupWithName = (groupName: string) => query<{
    private_group_id: string;
    created_by: string;
}>(sql('get-private-group-with-name')`
    SELECT
        private_group_id,
        created_by
    FROM
        privategroup
    WHERE
        name = lower(${groupName})
`).then(({ rows: [privateGroup] }) => privateGroup);
