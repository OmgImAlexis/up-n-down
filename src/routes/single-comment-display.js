const express = require('express')
const db = require('../db')
const myMisc = require('../misc.js')

const router = express.Router({mergeParams: true})
const htmlTitleComment = 'Comment #'

router.route('/')
    .get(async (req, res) => {
        const commentPublicId = req.params[0]
        const finalUserId = req.session.user ? req.session.user.user_id : -1
        const filterUserId = await db.getCurrEyesId(req)

        const {rows} = await db.getCommentWithPublic2(
            commentPublicId,
            myMisc.getCurrTimeZone(req),
            finalUserId,
            filterUserId)

        if(rows.length) {

            //
            const isAllowed = await db.isUserAllowedToViewPost(
                rows[0].private_group_ids,
                finalUserId)

            if(!isAllowed) {
                return res.render(
                    'message',
                    {
                        html_title: htmlTitleComment + commentPublicId,
                        message: "This comment is from a private group and you do not have access.",
                        user: req.session.user,
                        max_width: myMisc.getCurrSiteMaxWidth(req)
                    })
            }

            //
            let page = 1

            if(typeof req.query.p !== 'undefined') {
                page = parseInt(req.query.p)

                if(isNaN(page)) {
                    return res.redirect(`/c/${commentPublicId}`)
                }
            }

            //
            const isDiscoverMode = myMisc.isDiscover(req)

            const{rows:comments} = await db.getCommentComments(
                rows[0].path,
                myMisc.getCurrTimeZone(req),
                finalUserId,
                isDiscoverMode,
                filterUserId,
                page)

            res.render(
                'single-comment',
                {
                    html_title: htmlTitleComment + commentPublicId,
                    user: req.session.user,
                    post_public_id: rows[0].post_public_id,
                    comment: rows[0],
                    comments: comments,
                    errors: [],
                    is_discover_mode: isDiscoverMode,
                    comment_reply_mode: myMisc.getCurrCommentReplyMode(req),
                    max_width: myMisc.getCurrSiteMaxWidth(req),
                    page: page
                }
            )
        }
        else {
            res.send('not found..')
        }
    })
    .post(
        async (req, res) => {
            if(req.session.user) {
                const commentPublicId = req.params[0]
                const finalUserId = req.session.user ? req.session.user.user_id : -1
                const filterUserId = await db.getCurrEyesId(req)

                const {rows} = await db.getCommentWithPublic2(
                    commentPublicId,
                    myMisc.getCurrTimeZone(req),
                    finalUserId,
                    filterUserId)

                if(rows.length) {

                    //
                    const isAllowed = await db.isUserAllowedToViewPost(
                        rows[0].private_group_ids,
                        req.session.user.user_id)

                    if(!isAllowed) {
                        return res.render(
                            'message',
                            {
                                html_title: htmlTitleComment + commentPublicId,
                                message: "This comment is from a private group and you do not have access.",
                                user: req.session.user,
                                max_width: myMisc.getCurrSiteMaxWidth(req)
                            })
                    }

                    let [compressedComment, errors] = myMisc.processComment(req.body.text_content)

                    if(errors.length) {

                        //
                        const isDiscoverMode = myMisc.isDiscover(req)

                        const{rows:comments} = await db.getCommentComments(
                            rows[0].path,
                            myMisc.getCurrTimeZone(req),
                            finalUserId,
                            isDiscoverMode,
                            filterUserId)

                        res.render(
                            'single-comment',
                            {
                                html_title: htmlTitleComment + commentPublicId,
                                user: req.session.user,
                                post_public_id: rows[0].post_public_id,
                                comment: rows[0],
                                comments: comments,
                                errors: errors,
                                is_discover_mode: isDiscoverMode,
                                comment_reply_mode: myMisc.getCurrCommentReplyMode(req),
                                max_width: myMisc.getCurrSiteMaxWidth(req)
                            }
                        )
                    }
                    else {

                        //
                        const {rows:data1} = await db.createCommentComment(
                            rows[0].post_id,
                            req.session.user.user_id,
                            compressedComment,
                            rows[0].path,
                            'UTC')

                        //
                        await db.incPostNumComments(rows[0].post_id)
                        return res.redirect(`/c/${commentPublicId}#${data1[0].public_id}`)
                    }
                }
                else {
                    res.send('not found')
                }
            }
            else {
                res.send('nope...')
            }
    })

module.exports = router
