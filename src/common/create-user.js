import postgres from 'postgresql-tag';
import argon2 from 'argon2';
import { query } from '../db/index.js';
import { generateNanoId } from '../common/generate-nano-id.js';

/**
 * Create a user.
 * 
 * @param {string} username The user's username.
 * @param {string} password The user's plain text password.
 * @returns The newly created user.
 */
export const createUser = async (username, password) => {
    console.log(postgres`
    INSERT INTO tuser
        (username, password, public_id)
    VALUES
        (${username}, ${await argon2.hash(password)}, ${generateNanoId()})
    RETURNING
        user_id, username, time_zone, post_mode, eyes, comment_reply_mode, site_width
`);


    return query(postgres`
        INSERT INTO tuser
            (username, password, public_id)
        VALUES
            (${username}, ${await argon2.hash(password)}, ${generateNanoId()})
        RETURNING
            user_id, username, time_zone, post_mode, eyes, comment_reply_mode, site_width
    `);
}
