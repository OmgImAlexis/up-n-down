import sql from 'sql-tag';
import { query } from '../../db/index.js';
import { commentsPerPage } from '../../config/index.js';

/**
 * Get comment replies.
 * 
 * @param {string} path 
 * @param {string} timezone 
 * @param {string} userId 
 * @param {boolean} isDiscoverMode 
 * @param {string} filterUserId 
 * @param {string} page 
 * @returns 
 */
export const getCommentComments = (path, timezone, userId, isDiscoverMode, filterUserId, page) => query(sql`
    SELECT
        c.text_content,
        c.path,
        u.username,
        u.user_id,
        u.public_id as user_public_id,
        to_char(
            timezone(${timezone}, c.created_on),
            'Mon FMDD, YYYY FMHH12:MIam') created_on,
        c.created_on created_on_raw,
        c.public_id,
        u.user_id = ${userId} OR u.user_id = ${filterUserId} OR
            EXISTS(SELECT
                1
            FROM
                tfollower
            WHERE
                followee_user_id = u.user_id AND
                user_id = ${filterUserId}) is_visible,
        EXISTS(SELECT
                1
            FROM
                tfollower
            WHERE
                followee_user_id = u.user_id AND
                user_id = ${userId}) is_follow
    FROM
        ttest c
    JOIN
        tuser u on u.user_id = c.user_id
    WHERE
        c.path <@ ${path} AND
        NOT (c.path ~ ${path}) AND
        (${isDiscoverMode} OR NOT EXISTS(
            SELECT
                1
            FROM
                ttest c2
            WHERE
                c2.path @> c.path AND
                NOT EXISTS(SELECT 1 FROM tfollower WHERE user_id = ${filterUserId} AND followee_user_id = c2.user_id) AND
                c2.user_id != ${userId} AND
                c2.user_id != ${filterUserId} AND
                NOT (c2.path @> ${path})))
    ORDER BY
        c.path
    LIMIT
        ${commentsPerPage}
    OFFSET
        ${((page ?? 1) - 1) * commentsPerPage}
`).then(({ rows }) => rows);
