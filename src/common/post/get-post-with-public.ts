import { query } from '../../db.js';
import { sql } from '../sql-tag.js';

export const getPostWithPublic = (publicId: string) => query<{
    post_id: string;
    user_id: number;
    title: string;
    text_content?: string;
    link?: string;
    tags: string[];
    private_group_names: string[];
}>(sql('get-post-with-public')`
    SELECT
        p.post_id,
        p.user_id,
        p.title,
        p.text_content,
        p.link,
        ARRAY (
            SELECT
                t.tag
            FROM
                tag t
                JOIN posttag pt ON pt.tag_id = t.tag_id
            WHERE
                pt.post_id = p.post_id) AS tags,
        ARRAY (
            SELECT
                pg.name
            FROM
                privategroup pg
                JOIN tag t ON t.tag = pg.name
                JOIN posttag pt ON pt.tag_id = t.tag_id
            WHERE
                pt.post_id = p.post_id) AS private_group_names
    FROM
        post p
    WHERE
        p.public_id = ${publicId}
`).then(({ rows: [post] }) => post);
