import sql from 'sql-tag';
import { query } from '../../db/index.js';

/**
 *
 * @param {string} tagName
 * @returns
 */
export const createTag = tagName => query(sql`
    INSERT INTO tag
        (tag)
    VALUES
        (${tagName.toLowerCase()})
    RETURNING
        tag_id
`).then(({ rows: [tag] }) => tag);
