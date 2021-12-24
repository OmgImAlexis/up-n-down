import postgres from 'postgresql-tag';
import { query } from '../../db/index.js';
import { generateNanoId } from '../generate-nano-id.js'; 

/**
 * 
 * @param {string} userId The user's ID.
 * @param {string} title The post title.
 * @param {string} textContent The post's body text (optional).
 * @param {string} link The post's link (optional).
 * @param {string} domainNameId ? 
 * @returns {string} Post ID of newly created post.
 */
export const createPost = async (userId, title, textContent, link, domainNameId) => query(postgres`
    INSERT INTO tpost
        (public_id, user_id, title, text_content, link, domain_name_id)
    VALUES
        (${generateNanoId()}, ${userId}, ${title}, ${textContent.trim() || null}, ${link || null}, ${domainNameId})
    RETURNING
        post_id, public_id
`).then(({ rows: [row]}) => ({
    postId: row.post_id,
    publicId: row.public_id
}));
