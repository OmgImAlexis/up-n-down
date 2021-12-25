import sql from 'sql-tag';
import { query } from '../../db/index.js';

export const getPostWithPublic = (publicId) => query(sql`
    SELECT
        p.post_id,
        p.user_id,
        p.title,
        p.text_content,
        p.link,
        array(
            SELECT
                t.tag
            FROM
                ttag t
            JOIN
                tposttag pt on pt.tag_id = t.tag_id
            WHERE
                pt.post_id = p.post_id
        ) as tags,
        array(
            SELECT
                pg.name
            FROM
                tprivategroup pg
            JOIN
                ttag t on t.tag = pg.name
            JOIN
                tposttag pt on pt.tag_id = t.tag_id
            WHERE
                pt.post_id = p.post_id
        ) as private_group_names
    FROM
        tpost p
    WHERE
        p.public_id = ${publicId}
`).then(({ rows: [post] }) => post);