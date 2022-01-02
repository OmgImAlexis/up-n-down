import { query } from '../../db.js';
import { sql } from '../sql-tag.js';

export const getCommentWithPublicId = (publicId: string) => query<{
    comment_id: string;
    post_id: string;
    path: string;
    user_id: number;
    text_content: string;
    private_group_ids: string[];
}>(sql('get-comment-with-public-id')`
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
