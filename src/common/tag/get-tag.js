import sql from 'sql-tag';
import { query } from '../../db/index.js';

/**
 * 
 * @param {string} tagName 
 * @returns 
 */
export const getTag = (tagName) => query(sql`
    SELECT
        tag_id,
        num_posts
    FROM
        ttag
    WHERE
        tag = lower(${tagName})
`).then(({ rows: [tag] }) => tag);
