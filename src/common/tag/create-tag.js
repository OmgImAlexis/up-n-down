import sql from 'sql-tag';
import { query } from '../../db.js';

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
