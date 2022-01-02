import { query } from '../../db.js';
import { sql } from '../sql-tag.js';

/**
 * Increase the comment count on a post.
 */
export const increasePostNumberOfComments = (postId: string) => query(sql('increase-post-number-of-comments')`
    UPDATE
        post
    SET
        num_comments = num_comments + 1
    WHERE
        post_id = ${postId}
`);
