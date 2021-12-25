import sql from 'sql-tag';
import { query } from '../../db/index.js';

/**
 * 
 * @param {string} groupName
 * @param {string} groupId 
 * @returns 
 */
export const createPrivateGroup = (groupName, userId) => query(sql`
    INSERT INTO tprivategroup
        (created_by, name)
    VALUES
        (${userId}, ${groupName})
`).then(({ rows: [group] }) => group);
