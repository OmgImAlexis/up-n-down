import sql from 'sql-tag';
import { query } from '../../db.js';

export const deletePostTags = postId => query(sql`
    DELETE FROM
        posttag
    WHERE
        post_id = ${postId}
`);
