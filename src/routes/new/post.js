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
        if (!req.session.user) return res.send('nope...');

        const [validationError] = validationResult(req).array({ onlyFirstError: true });
        if (validationError) throw new Error(validationError.msg);

        // Compress title?
        const wsCompressedTitle = processPostTitle(req.body.title);

        //
        let [trimTags, tagErrors] = myMisc.processPostTags(req.body.tags)
        errors = errors.concat(tagErrors)

        // check private group permissions
        if (!errors.length && trimTags.length) {
            const {rows:privateGroups} = await db.getPrivateGroupsWithNames(trimTags)

            for(let i = 0; i < privateGroups.length; ++i) {
                const pGroup = privateGroups[i]

                if(req.session.user.user_id == pGroup.created_by) {
                    continue
                }

                const {rows:gMember} = await db.getGroupMember(
                    pGroup.private_group_id,
                    req.session.user.user_id)

                if(!gMember.length) {
                    errors.push({msg: "You used a private group you don't have access to"})
                    break
                }
            }
        }
    } catch (error) {
        res.render('new-post2', {
            title,
            user: req.session.user,
            error,
            title: req.body.title,
            link: req.body.link,
            textContent: req.body.text_content,
            tags: req.body.tags,
            submitLabel: 'Create Post',
            heading: 'New Post'
        });
    }

        //
        let domainNameId = null

        if(typeof req.body.link !== 'undefined') {
            const domainName = myMisc.getDomainName(req.body.link)
            domainNameId = await db.getDomainNameId(domainName)
        }

        //
        let vals = db.createPost(
            req.session.user.user_id,
            wsCompressedTitle,
            req.body.text_content,
            req.body.link,
            domainNameId)

        const {rows} = await vals[0]

        //
        await db.createPostTags(trimTags, rows[0].post_id)
        
        //
        return res.redirect('/p/' + vals[1])
    }
};
