import sql from 'sql-tag';
import { query } from '../../db.js';

/**
 *
 * @param {string} groupId
 * @param {string} userId
 * @returns
 */
export const getGroupMember = (groupId, userId) => query(sql`
    SELECT
        group_member_id
    FROM
        groupmember
    WHERE
        private_group_id = ${groupId} and
        user_id = ${userId}
`).then(({ rows }) => rows);
