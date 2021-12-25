import sql from 'sql-tag';
import { query } from '../../db/index.js';
import { increasePostNumberOfComments } from '../post/increase-post-number-of-comments.js';
import { numberToOrderedAlpha } from '../utils/number-to-ordered-alpha.js';

// @todo: Convert this to using SQL transactions

export const createCommentComment = async (postId, userId, content, parentPath, timezone) => {
    const path = `${parentPath}.*{1}`;

    // Get current comment count
    const { rows: [{ count }] } = await query(sql`
        SELECT
            count(1) as count
        FROM
            ttest
        WHERE
            path ~ ${path}
    `);

    // Increase amount of comments on associated post
    await increasePostNumberOfComments(postId);

    // Create reply
    const { rows: [reply] } = await query(sql`
        INSERT INTO ttest
            (post_id, user_id, text_content, path)
        VALUES
            (${postId}, ${userId}, ${content}, ${parentPath + '.' + numberToOrderedAlpha(parseInt(count, 10) + 1)})
        RETURNING
            public_id,
            text_content,
            to_char(timezone(${timezone}, created_on), 'Mon FMDD, YYYY FMHH12:MIam') created_on
    `);

    return reply;
};
