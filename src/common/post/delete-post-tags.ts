import { query } from '../../db.js';
import { sql } from '../sql-tag.js';

export const deletePostTags = (postId: string) => query(sql('delete-post-tags')`
    DELETE FROM posttag
    WHERE post_id = ${postId}
`);
