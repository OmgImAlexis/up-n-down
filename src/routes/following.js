const express = require('express')
const db = require('../db')
const myMisc = require('../misc.js')

const router = express.Router()

router.route('/')
    .get()
    .post()

//renderFollowing(req, res, [], '')
async function renderFollowing(req, res, errors, formUsername) {
    const {rows} = await db.(req.session.user.user_id)

    //
    res.render(
        'following',
        {
            title: 'Following',
            errors: errors,
            followees: rows,
            formUsername: formUsername,
            max_width: myMisc.getCurrSiteMaxWidth(req)
        }
    )
}
