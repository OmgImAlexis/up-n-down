async (req, res) => {
    if(req.session.user) {

        //
        let errors = []

        if(req.body.username === '') {
            errors.push({msg: 'Please fill in a username'})
        }

        //
        if(errors.length) {
            renderFollowing(req, res, errors, req.body.username)
        }
        else {
            const {rows} = await db.getUserWithUsername(req.body.username)

            if(rows.length) {

                if(req.session.user.user_id == rows[0].user_id) {
                    renderFollowing(req, res,
                        [{msg: 'You don\'t need to follow yourself'}],
                        req.body.username)
                }
                else {
                    //
                    const {rows:rows2} = await db.isUserFollowing(
                        req.session.user.user_id,
                        rows[0].user_id
                    )

                    //
                    if(rows2.length) {
                        renderFollowing(req, res,
                            [{msg: 'You are already following that user'}],
                            req.body.username)
                    }
                    else {
                        await db.addFollower(
                            req.session.user.user_id,
                            rows[0].user_id
                        )

                        return res.redirect('/following')
                    }
                }
            }
            else {
                renderFollowing(req, res, [{msg: 'No such user'}], req.body.username)
            }
        }
    }
    else {
        res.send('permission denied...')
    }
}