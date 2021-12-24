import postgres from 'postgresql-tag';
import { query } from '../../db/index.js';
import { commentsPerPage } from '../../config/index.js';

export const getPostComments = (postId, timeZone, userId, isDiscoverMode, filterUserId, page) => {
    const limit = commentsPerPage
    const offset = (page - 1) * commentsPerPage

    return query(postgres`
        SELECT
            c.text_content,
            c.path,
            u.username,
            u.user_id,
            u.public_id as user_public_id,
            to_char(
                timezone(${timeZone}, c.created_on),
                'Mon FMDD, YYYY FMHH12:MIam') created_on,
            c.created_on created_on_raw,
            c.public_id,
            c.is_removed,
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
            c.path <@ ${postId} AND
            (${isDiscoverMode} OR NOT exists(
                select
                    1
                from
                    ttest c2
                WHERE
                    c2.path @> c.path AND
                    not exists(select 1 from tfollower WHERE user_id = ${filterUserId} AND followee_user_id = c2.user_id) AND
                    c2.user_id != ${userId} AND
                    c2.user_id != ${filterUserId}))
        ORDER BY
            c.path
        LIMIT
            ${limit}
        OFFSET
            ${offset}
    `);
};
