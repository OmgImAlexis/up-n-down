import sql from 'sql-tag';
import { query } from '../../db/index.js';

export const getCommentWithPublic2 = (publicId, timezone, userId, filterUserId) => query(sql`
    SELECT
        c.text_content,
        to_char(
            timezone(${timezone}, c.created_on),
            'Mon FMDD, YYYY FMHH12:MIam') created_on,
        c.created_on created_on_raw,
        c.path,
        c.post_id,
        c.public_id comment_public_id,
        u.username,
        u.user_id,
        u.public_id as user_public_id,
        p.public_id post_public_id,
        u.user_id = ${userId} or u.user_id = ${filterUserId} or
            exists(SELECT
                1
            FROM
                follower
            WHERE
                followee_user_id = u.user_id and
                user_id = ${filterUserId}) is_visible,
        exists(SELECT
                1
            FROM
                follower
            WHERE
                followee_user_id = u.user_id and
                user_id = ${userId}) is_follow,
        array(
            SELECT
                pg.private_group_id
            FROM
                privategroup pg
            JOIN
                tag t on t.tag = pg.name
            JOIN
                posttag pt on pt.tag_id = t.tag_id
            WHERE
                pt.post_id = p.post_id
        ) as private_group_ids
    FROM
        comment c
    JOIN
        "user" u on u.user_id = c.user_id
    JOIN
        post p on p.post_id = c.post_id
    WHERE
        not p.is_removed and
        c.public_id = ${publicId}
`).then(({ rows: [comment] }) => comment);
