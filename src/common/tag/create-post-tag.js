import sql from 'sql-tag';
import { query } from '../../db/index.js';

/**
 *
 * @param {string} tagId
 * @param {string} postId
 * @returns
 */
export const createPostTag = (tagId, postId) => query(sql`
    INSERT INTO tposttag
        (tag_id, post_id)
    VALUES
        (${tagId}, ${postId})
`);
