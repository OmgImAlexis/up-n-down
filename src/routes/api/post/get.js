async (req, res) => {

    //
    if(typeof req.query.postid === 'undefined') {
        return res.json(0)
    }

    //
    const postPublicId = req.query.postid
    const userId = -1
    const filterUserId = 1

    //
    const {rows} = await db.getPostWithPublic2(
        postPublicId,
        'UTC',
        userId,
        filterUserId)

    //
    if(rows.length) {

        //
        const isAllowed = await db.isUserAllowedToViewPost(
            rows[0].private_group_ids,
            userId)

        if(!isAllowed) {
            return res.json(0)
        }

        //
        let isDiscoverMode = false

        if(typeof req.query.viewmode !== 'undefined' &&
            req.query.viewmode.toLowerCase() == 'discover')
        {
            isDiscoverMode = true
        }

        const{rows:comments} = await db.getPostComments(
            rows[0].post_id,
            'UTC',
            userId,
            isDiscoverMode,
            filterUserId)

        //
        let comments2 = []

        for(const i in comments) {
            const c = comments[i]
            const dotCount = (c.path.match(/\./g)||[]).length

            comments2.push({
                comment_text: c.is_visible ? c.text_content : false,
                indent_level: dotCount - 1,
                by: c.username,
                comment_time: c.created_on_raw,
                comment_id: c.public_id
            })
        }
        
        let r = {
            title: rows[0].is_visible ? rows[0].title : false,
            link: rows[0].is_visible ? rows[0].link : false,
            post_text: rows[0].is_visible ? rows[0].text_content : false,
            post_time: rows[0].created_on_raw,
            by: rows[0].username,
            comments: comments2,
            groups: rows[0].tags
        }

        res.json(r)
    }
    else {
        res.json(0)
    }
}