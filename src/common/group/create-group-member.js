import sql from 'sql-tag';
import { query } from '../../db/index.js';

/**
 *
 * @param {string} privateGroupId
 * @param {string} publicUserId
 * @returns
 */
export const createGroupMember = (groupId, userId) => query(sql`
    INSERT INTO groupmember
        (private_group_id, user_id)
    VALUES
        (${groupId}, ${userId})
`).then(({ rows }) => rows);
