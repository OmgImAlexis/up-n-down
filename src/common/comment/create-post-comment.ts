import { numberToOrderedAlpha } from '../utils/number-to-ordered-alpha.js';
import { query } from '../../db.js';
import { increasePostNumberOfComments } from '../post/increase-post-number-of-comments.js';
import { sql } from '../sql-tag.js';

// @todo: Convert this to using SQL transactions

/**
 * Create a comment on a post.
 *
 * @param postId The post's private ID.
 * @param userId The user's ID.
 * @param content The content of the comment.
 */
export const createPostComment = async (postId: string, userId: number, content: string) => {
    const path = `${parseInt(postId, 10)}.*{1}`;

    // Get current comment count
    const { rows: [{ count }] } = await query(sql('get-current-comment-count')`
        SELECT
            count(1) as count
        FROM
            comment
        WHERE
            "path" ~ ${path}
    `);

    // Update the amount of comments on this post
    await increasePostNumberOfComments(postId);

    // Save comment to database
    const comment = await query(sql('create-post-comment')`
        INSERT INTO comment (post_id, user_id, text_content, "path")
            VALUES (${postId}, ${userId}, ${content}, ${postId + '.' + numberToOrderedAlpha(parseInt(count, 10) + 1)})
        RETURNING
            public_id
    `);

    return comment;
};
