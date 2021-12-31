import sql from 'sql-tag';
import { query } from '../../db.js';

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

