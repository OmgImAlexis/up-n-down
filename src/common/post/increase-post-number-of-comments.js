import postgres from 'postgresql-tag';
import { query } from '../../db/index.js';

/**
 * Increase the comment count on a post.
 * 
 * @param {string} postId 
 */
export const increasePostNumberOfComments = (postId) => query(postgres`
    UPDATE
        tpost
    SET
        num_comments = num_comments +1
    WHERE
        post_id = ${postId}
`);
