import { validationResult } from 'express-validator';
import { processPostTitle } from '../../common/post/process-post-title.js';
import { getDomainName } from '../../common/get-domain-name.js';
import { processPostTags } from '../../common/post/process-post-tags.js';
import { createPost } from '../../common/post/create-post.js';
import { getDomainNameId } from '../../common/get-domain-name-id.js';
import { createPostTags } from '../../common/post/create-post-tags.js';

const title = 'New Post';

/**
 * Process new post form.
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @returns 
 */
export const postNew = async (req, res) => {
    try {
        if (!req.session.user) throw new Error('You must be logged in to create posts.');

        const [validationError] = validationResult(req).array({ onlyFirstError: true });
        if (validationError) throw new Error(validationError.msg);

        // Process title
        const title = processPostTitle(req.body.title);

        // Process tags
        const tags = processPostTags(req.body.tags);

        // Check the user has permission to post in this private group
        if (tags.length > 0) {
            const privateGroups = await getPrivateGroupsWithNames(tags);

            for (const privateGroup of privateGroups) {
                // If this is not the owner then check they're a member of the group
                if (req.session.user.user_id !== pGroup.created_by) {
                    const groupMember = await getGroupMember(pGroup.private_group_id, req.session.user.user_id);
                    if (!groupMember) throw new Error('You used a private group you don\'t have access to');    
                }
            }
        }

        // Get the domain name ID
        const domainNameId = req.body.link ? await getDomainNameId(getDomainName(req.body.link)) : null;

        // Create the post
        const { postId, publicId } = await createPost(
            req.session.user.user_id,
            title,
            req.body.text_content,
            req.body.link,
            domainNameId
        );

        // Create post tags
        // This should be moved to createPost
        // There's no need for this to be separate
        await createPostTags(tags, postId);
        
        // Send the user to the newly created post
        return res.redirect(`/p/${publicId}`);
    } catch (error) {
        res.render('new-post2', {
            html: {
                title
            },
            error,
            title: req.body.title,
            link: req.body.link,
            textContent: req.body.text_content,
            tags: req.body.tags,
            submitLabel: 'Create Post',
            heading: 'New Post'
        });
    }
};
