import argon2 from 'argon2';
import { query } from '../../db.js';
import { sql } from '../sql-tag.js';

/**
 * Create a user.
 *
 * @param username The user's username.
 * @param password The user's plain text password.
 * @returns The newly created user.
 */
export const createUser = async (username: string, password: string) => query<{
    user_id: number;
    username: string;
    time_zone: string;
    post_mode: string;
    eyes: string;
    comment_reply_mode: string;
    site_width: number;
}>(sql('create-user')`
    INSERT INTO "user" (username, "password")
        VALUES (${username}, ${await argon2.hash(password)})
    RETURNING
        user_id, username, time_zone, post_mode, eyes, comment_reply_mode, site_width
`).then(({ rows: [user] }) => user);
