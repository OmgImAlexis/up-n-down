import { query } from '../../db.js';
import { sql } from '../sql-tag.js';

export const getTag = (tagName: string) => query<{ tag_id: string; num_posts: number; }>(sql('get-tag')`
    SELECT
        tag_id,
        num_posts
    FROM
        tag
    WHERE
        tag = lower(${tagName})
`).then(({ rows: [tag] }) => tag);
