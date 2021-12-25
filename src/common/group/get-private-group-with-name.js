import sql from 'sql-tag';
import { query } from '../../db/index.js';

/**
 * 
 * @param {string} groupName 
 * @returns 
 */
export const getPrivateGroupWithName = (groupName) => query(sql`
    SELECT
        private_group_id,
        created_by
    FROM
        tprivategroup
    WHERE
        name = lower(${groupName})
`).then(({ rows: [privateGroup] }) => privateGroup);
