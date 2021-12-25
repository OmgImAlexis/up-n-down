import { getPostWithPublic } from '../../../common/post/get-post-with-public.js';

/**
 * Render the edit page for a post
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @returns 
 */
export const getPostEdit = async (req, res) => {
    const postPublicId = req.params.postId;
    const post = await getPostWithPublic(postPublicId);
    if (!post) throw new Error('Unknown post.');
    if (post.user_id !== req.session.user.user_id) throw new Error('Permission denied!');

    // Render post edit page
    res.render('new-post2', {
        html: {
            title: 'Edit Post'
        },
        title: post.title,
        link: post.link || '',
        textContent: post.text_content,
        tags: post.tags.join(', '),
        submitLabel: 'Edit Post',
        heading: 'Edit Post'
    });
};
