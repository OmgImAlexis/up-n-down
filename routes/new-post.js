const express = require('express')
const {body, validationResult} = require('express-validator')
const db = require('../db')
const myMisc = require('../misc.js')

const router = express.Router()
const htmlTitleNewPost = 'New Post'

router.route('/')
    .get(async (req, res) => {
        if(req.session.user) {

            //
            const tags = (typeof req.query.group !== 'undefined')
                ? req.query.group
                : "";

            //
            res.render(
                'new-post2',
                {
                    html_title: htmlTitleNewPost,
                    user: req.session.user,
                    errors: [],
                    title: "",
                    link: "",
                    textContent: "",
                    tags: tags,
                    submitLabel: 'Create Post',
                    max_width: myMisc.getCurrSiteMaxWidth(req)
                })
        }
        else {
            res.render(
                'message',
                {
                    html_title: htmlTitleNewPost,
                    message: "Please <a href=\"/login\">log in</a> to create a post.",
                    user: req.session.user,
                    max_width: myMisc.getCurrSiteMaxWidth(req)
                })
        }
    })
    .post(
        (req, res, next) => {

            //remove if blank so it doesn't trigger the validator
            if(req.body.link === '') {
                req.body.link = undefined
            }
    
            next()
        },
        body('text_content', 'Please write some content').optional(),
        body('link', 'link must be a URL to a website').optional().isURL(),
        async (req, res) => {
            if(req.session.user) {
                let errors = validationResult(req).array({onlyFirstError:true})

                //
                let [wsCompressedTitle, error] = myMisc.processPostTitle(req.body.title)

                if(error !== null) {
                    errors.push(error)
                }

                //
                let [trimTags, tagErrors] = myMisc.processPostTags(req.body.tags)
                errors = errors.concat(tagErrors)

                //
                if(errors.length) {
                    res.render(
                        'new-post2',
                        {
                            html_title: htmlTitleNewPost,
                            user: req.session.user,
                            errors: errors,
                            title: req.body.title,
                            link: (typeof req.body.link !== 'undefined' ? req.body.link : ''),
                            textContent: req.body.text_content,
                            tags: req.body.tags,
                            submitLabel: 'Create Post',
                            max_width: myMisc.getCurrSiteMaxWidth(req)
                        })
                }
                else {
                    let vals = db.createPost(
                        req.session.user.user_id,
                        wsCompressedTitle,
                        req.body.text_content,
                        req.body.link)
    
                    const {rows} = await vals[0]

                    //
                    await db.createPostTags(trimTags, rows[0].post_id)
                    
                    //
                    return res.redirect('/p/' + vals[1])
                }
            }
            else {
                res.send('nope...')
            }
        }
    )

module.exports = router