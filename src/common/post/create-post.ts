import { query } from '../../db.js';
import { createConnectedClientsNotification } from '../firehose.js';
import { sql } from '../sql-tag.js';

/**
 *
 * @param userId The user's ID.
 * @param title The post title.
 * @param textContent The post's body text (optional).
 * @param link The post's link (optional).
 * @param domainNameId ?
 */
export const createPost = async (userId: number, title: string, textContent: string, link: string, domainNameId: string) => query<{
	title: string;
	text_content: string;
	domain_name_id: string;
	post_id: string;
	public_id: string;
	link: string;
}>(sql('create-post')`
	INSERT INTO post (user_id, title, text_content, link, domain_name_id)
		VALUES (${userId}, ${title}, ${textContent.trim() || null}, ${link || null}, ${domainNameId})
	RETURNING
		title, text_content, domain_name_id, link, post_id, public_id
`).then(({ rows: [row] }) => ({
	title: row.title,
	content: row.text_content,
	domainNameId: row.domain_name_id,
	postId: row.post_id,
	publicId: row.public_id,
	link: row.link,
})).then(post => {
	const content = `Title: ${post.title}${post.link ? `<br>Link: ${post.link}` : ''}`;
	createConnectedClientsNotification({ title: 'New Post', link: `/p/${post.publicId}`, content });
	return post;
});
