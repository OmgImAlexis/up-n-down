import sql from 'sql-tag';
import argon2 from 'argon2';
import { query } from '../../db.js';

/**
 * Create a user.
 *
 * @param {string} username The user's username.
 * @param {string} password The user's plain text password.
 * @returns The newly created user.
 */
export const createUser = async (username, password) => query(sql`
    INSERT INTO "user"
        (username, password)
    VALUES
        (${username}, ${await argon2.hash(password)})
    RETURNING
        user_id, username, time_zone, post_mode, eyes, comment_reply_mode, site_width
`).then(({ rows: [user] }) => user);
