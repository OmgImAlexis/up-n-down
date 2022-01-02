import { query } from '../../db.js';
import { sql } from '../sql-tag.js';

export const updatePost = (postId: string, title: string, textContent: string, link: string, domainNameId: string) => query<void>(sql('update-post')`
    UPDATE
        post
    SET
        title = ${title},
        link = ${link},
        text_content = ${textContent},
        domain_name_id = ${domainNameId}
    WHERE
        post_id = ${postId}
`);
