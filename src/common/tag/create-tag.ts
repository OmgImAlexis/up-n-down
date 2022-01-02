import { query } from '../../db.js';
import { sql } from '../sql-tag.js';

export const createTag = (tagName: string) => query<{ tag_id: string; }>(sql('create-tag')`
    INSERT INTO tag (tag)
        VALUES (${tagName.toLowerCase()})
    RETURNING
        tag_id
`).then(({ rows: [tag] }) => tag);
