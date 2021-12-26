import sql from 'sql-tag';
import { query } from '../../db/index.js';

/**
 * Increase the comment count on a post.
 *
 * @param {string} postId
 */
export const increasePostNumberOfComments = postId => query(sql`
    UPDATE
        tpost
    SET
        num_comments = num_comments +1
    WHERE
        post_id = ${postId}
`);
