import postgres from 'postgresql-tag';
import { query } from '../db/index.js';

export const getAvailableEyes = (userId) => query(postgres`
    SELECT username FROM tuser WHERE is_eyes
    ORDER BY lower(username)
`).then(({ rows }) => rows[0]);
