import sql from 'sql-tag';
import { query } from '../../db/index.js';

/**
 *
 * @param {string} commentId
 * @param {string} textContent
 * @returns
 */
export const updateComment = (commentId, textContent) => query(sql`
    UPDATE
        comment
    SET
        text_content = ${textContent}
    WHERE
        comment_id = ${commentId}
`);
