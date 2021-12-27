import sql from 'sql-tag';
import { query } from '../../db/index.js';

export const getUserCreatedPrivateGroups = userId => query(sql`
    SELECT
        name
    FROM
        privategroup
    WHERE
        created_by = ${userId}
    ORDER BY
        name
`).then(({ rows }) => rows);

