import sql from 'sql-tag';
import { numberToOrderedAlpha } from '../utils/number-to-ordered-alpha.js';
import { query } from '../../db/index.js';
import { increasePostNumberOfComments } from '../post/increase-post-number-of-comments.js';

// @todo: Convert this to using SQL transactions

/**
 * Create a comment on a post.
 *
 * @param {string} postId The post's private ID.
 * @param {string} userId The user's ID.
 * @param {string} content The content of the comment.
 */
export const createPostComment = async (postId, userId, content) => {
	const path = `${parseInt(postId, 10)}.*{1}`;

	// Get current comment count
	const { rows: [{ count }] } = await query(sql`
        SELECT
            count(1) as count
        FROM
            ttest
        WHERE
            path ~ ${path}
    `);

	// Update the amount of comments on this post
	await increasePostNumberOfComments(postId);

	// Save comment to database
	await query(sql`
        INSERT INTO ttest
            (post_id, user_id, text_content, path)
        VALUES
            (${postId}, ${userId}, ${content}, ${postId + '.' + numberToOrderedAlpha(parseInt(count, 10) + 1)})
        RETURNING
            public_id
    `);
};
