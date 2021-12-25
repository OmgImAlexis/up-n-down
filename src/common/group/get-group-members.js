import sql from 'sql-tag';
import { query } from '../../db/index.js';

/**
 * 
 * @param {string} groupId 
 * @returns 
 */
export const getGroupMembers = (groupId) => query(sql`
    SELECT
        u.public_id,
        u.username
    FROM
        tuser u
    JOIN
        tgroupmember gm on gm.user_id = u.user_id
    WHERE
        gm.private_group_id = ${groupId}
    ORDER BY
        u.username
`).then(({ rows }) => rows);