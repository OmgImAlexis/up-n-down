import postgres from 'postgresql-tag';
import { generateNanoId } from '../../../common/generate-nano-id.js';
import { numberToOrderedAlpha } from '../../../common/number-to-ordered-alpha.js';
import { query } from '../../../db/index.js';

/**
 * Create a comment on a post.
 * 
 * @param {string} postId The post's private ID.
 * @param {string} userId The user's ID.
 * @param {string} content The content of the comment.
 */
export const createPostComment = async (postId, userId, content) => {
    // @todo: Convert this to using SQL transactions

    const path = `${parseInt(postId)}.*{1}`;

    // Get current comment count?
    const { rows: [{ count }] } = await query(postgres`
        SELECT
            count(1) as count
        FROM
            ttest
        WHERE
            path ~ ${path}
    `);

    // Save comment to database
    await query(postgres`
        INSERT INTO ttest
            (post_id, user_id, text_content, path, public_id)
        VALUES
            (${postId}, ${userId}, ${content}, ${postId + '.' + numberToOrderedAlpha(parseInt(count, 10) + 1)}, ${generateNanoId()})
        RETURNING
            public_id
    `);

    // Update the amount of comments on this post
    await query(postgres`
        UPDATE
            tpost
        SET
            num_comments = num_comments +1
        WHERE
            post_id = ${postId}
    `);
};
