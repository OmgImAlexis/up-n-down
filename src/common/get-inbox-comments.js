import sql from 'sql-tag';
import { query } from '../db/index.js';
import { postsPerPage } from '../config/index.js';

export const getInboxComments = (timezone, userId, isDiscoverMode, filterUserId, page) => query(sql`
    SELECT
        c.text_content,
        c.path,
        u.username,
        u.user_id,
        u.public_id as user_public_id,
        to_char(
            timezone(${timezone}, c.created_on),
            'Mon FMDD, YYYY FMHH12:MIam') created_on,
        c.public_id,
        c.is_removed,
        u.user_id = ${userId} or u.user_id = ${filterUserId} or
            EXISTS(SELECT
                1
            FROM
                follower
            WHERE
                followee_user_id = u.user_id and
                user_id = ${filterUserId}) is_visible,
        EXISTS(SELECT
                1
            FROM
                follower
            WHERE
                followee_user_id = u.user_id and
                user_id = ${userId}) is_follow
    FROM
        comment c
    JOIN
        "user" u on u.user_id = c.user_id
    JOIN
        post p on p.post_id = c.post_id
    WHERE
        (
            (nlevel(c.path) = 2 and p.user_id = ${userId}) or
            (nlevel(c.path) > 2 and (select user_id from comment where path = subpath(c.path, 0, -1)) = ${userId})
        ) and
        (${isDiscoverMode} or c.user_id = ${userId} or c.user_id = ${filterUserId} or
            EXISTS(SELECT
                1
            FROM
                follower
            WHERE
                followee_user_id = c.user_id and
                user_id = ${filterUserId}))
    ORDER BY
        c.created_on desc
    LIMIT
        ${postsPerPage}
    OFFSET
        ${(page - 1) * postsPerPage}
`);
