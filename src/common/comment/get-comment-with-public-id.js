import sql from 'sql-tag';
import { query } from '../../db.js';

export const getCommentWithPublicId = publicId => query(sql`
    SELECT
        c.comment_id,
        c.post_id,
        c.path,
        c.user_id,
        c.text_content,
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
                pt.post_id = c.post_id
        ) as private_group_ids
    FROM
        comment c
    WHERE
        c.public_id = ${publicId}
`).then(({ rows: [comment] }) => comment);
