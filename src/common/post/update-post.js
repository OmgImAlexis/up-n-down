import sql from 'sql-tag';
import { query } from '../../db/index.js';

export const updatePost = (postId, title, textContent, link, domainNameId) => query(sql`
    UPDATE
        tpost
    SET
        title = ${title},
        link = ${link},
        text_content = ${textContent},
        domain_name_id = ${domainNameId}
    WHERE
        post_id = ${postId}
`);
