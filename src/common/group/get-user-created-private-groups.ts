import { query } from '../../db.js';
import { sql } from '../sql-tag.js';

export const getUserCreatedPrivateGroups = (userId: string) => query(sql('get-user-created-private-groups')`
    SELECT
        name
    FROM
        privategroup
    WHERE
        created_by = ${userId}
    ORDER BY
        name
`).then(({ rows }) => rows);

