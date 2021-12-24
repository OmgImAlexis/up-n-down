import postgres from 'postgresql-tag';
import { query } from '../../db/index.js';

/**
 * 
 * @param {string} commentId 
 * @param {string} textContent 
 * @returns 
 */
export const updateComment = (commentId, textContent) => query(postgres`
    UPDATE
        ttest
    SET
        text_content = ${textContent}
    WHERE
        comment_id = ${commentId}
`);
