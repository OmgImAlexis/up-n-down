/**
 * Progress user settings change
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
export const postSettings = async (req, res) => {
    const {rows} = await db.getTimeZoneWithName(req.body.time_zone)

    let eyesOkay = true;
    let eyesValue = null;

    if(req.body.eyes !== "") {
        const {rows:eyesLookup} = await db.getUserWithUsername(req.body.eyes)

        if(eyesLookup.length && eyesLookup[0].is_eyes) {
            eyesValue = eyesLookup[0].user_id
        }
        else {
            eyesOkay = false
        }
    }

    let errors = []

    if(!rows.length) {
        errors.push({msg: 'unknown time zone, pick again'})
    }

    if(!eyesOkay) {
        errors.push({msg: 'bad following list'})
    }

    const siteWidthInt = parseInt(req.body.site_width)
    const wisNaN = isNaN(siteWidthInt)
    const widthOkay = (req.body.site_width === '') ||
        (!wisNaN && siteWidthInt >= 500 && siteWidthInt <= 1000)

    if(!widthOkay) {
        errors.push({msg: 'site width must be between 500-1000, or left blank'})
    }

    //
    const {rows:rows2} = await db.getTimeZones()
    const {rows:avaEyes} = await db.getAvailableEyes()
    const currEyes = req.body.eyes

    //
    if (errors.length) {
        return res.render('my-settings', {
            title: htmlTitleSettings,
            errors,
            time_zones: rows2,
            time_zone: req.body.time_zone,
            avaEyes: avaEyes,
            currEyes: currEyes,
            postMode: req.body.post_mode,
            commentReplyMode: req.body.comment_reply_mode,
            siteWidth: req.body.site_width,
            max_width: myMisc.getCurrSiteMaxWidth(req)
        })
    }
    //
    const siteWidthEmptied = req.body.site_width === ''
        ? ''
        : siteWidthInt

    //
    const siteWidthNulled = req.body.site_width === ''
        ? null
        : siteWidthInt

    //
    if(req.session.user) {
        await db.updateUser(
            req.session.user.user_id,
            req.body.time_zone,
            req.body.post_mode,
            req.body.comment_reply_mode,
            siteWidthNulled,
            eyesValue)

        req.session.user.time_zone = req.body.time_zone
        req.session.user.post_mode = req.body.post_mode
        req.session.user.comment_reply_mode = req.body.comment_reply_mode
        req.session.user.site_width = siteWidthNulled
        
        req.session.user.eyes = eyesValue
    } else {
        res.cookie(
            'time_zone',
            req.body.time_zone,
            {maxAge: cookieMaxAge})

        res.cookie(
            'eyes',
            req.body.eyes,
            {maxAge: cookieMaxAge})

        res.cookie(
            'post_mode',
            req.body.post_mode,
            {maxAge: cookieMaxAge})

        res.cookie(
            'comment_mode',
            req.body.comment_mode,
            {maxAge: cookieMaxAge})

        res.cookie(
            'site_width',
            siteWidthEmptied,
            {maxAge: cookieMaxAge})
    }

    res.render('my-settings', {
        title,
        errors: [{msg: 'Settings successfully saved.'}],
        time_zones: rows2,
        time_zone: req.body.time_zone,
        avaEyes: avaEyes,
        currEyes: currEyes,
        postMode: req.body.post_mode,
        commentReplyMode: req.body.comment_reply_mode,
        siteWidth: req.body.site_width,
        max_width: siteWidthNulled
    });
};