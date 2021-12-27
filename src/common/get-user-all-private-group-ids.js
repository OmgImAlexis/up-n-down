import sql from 'sql-tag';
import { query } from '../db/index.js';

/**
 *
 * @param {string} userId The user's ID.
 * @returns
 */
export const getUserAllPrivateGroupIds = userId => query(sql`
    SELECT
        private_group_id
    FROM
        privategroup
    WHERE
        created_by = ${userId}

    UNION

    SELECT
        pg.private_group_id
    FROM
        privategroup pg
    JOIN
        groupmember gm on gm.private_group_id = pg.private_group_id
    WHERE
        gm.user_id = ${userId}
`).then(({ rows }) => rows.map(row => row.private_group_id));
