import { query } from '../db.js';
import { sql } from './sql-tag.js';

export const getAvailableEyes = () => query<{ username: string; }>(sql('get-available-eyes')`
    SELECT username FROM "user" WHERE is_eyes
    ORDER BY lower(username)
`).then(({ rows: [eyes] }) => eyes);
