import { query } from '../../db.js';
import { sql } from '../sql-tag.js';

export const createPostTag = (tagId: string, postId: string) => query(sql('create-post-tag')`
    INSERT INTO posttag (tag_id, post_id)
        VALUES (${tagId}, ${postId})
`);
