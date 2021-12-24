import postgres from 'postgresql-tag';
import { query } from '../../db/index.js';

export const getCommentWithPublicId = (publicId) => query(postgres`
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
                tprivategroup pg
            JOIN
                ttag t on t.tag = pg.name
            JOIN
                tposttag pt on pt.tag_id = t.tag_id
            WHERE
                pt.post_id = c.post_id
        ) as private_group_ids
    FROM
        ttest c
    WHERE
        c.public_id = ${publicId}
`).then(({ rows: [comment] }) => comment);
