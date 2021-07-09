
//
exports.getCurrTimeZone = (req) => {
    let timeZone = undefined

    if(req.session.user) {
        timeZone = req.session.user.time_zone
    }
    else {
        timeZone = req.cookies.time_zone
    }

    //
    if(typeof timeZone === 'undefined') {
        timeZone = 'UTC'
    }

    //
    return timeZone
}

//
exports.processComment = (rawText) => {
    const noWhitespace = rawText.replace(/\s/g, '')
    const numNonWsChars = noWhitespace.length
    const compressedText = rawText.trim()
    const errors = []

    if(rawText.length === 0) {
        errors.push({'msg': 'Please fill in a comment'})
    }
    else if(numNonWsChars < 1) {
        errors.push({'msg': 'Comment must be at least 1 character'})
    }

    //
    return [compressedText, errors]
}

//
exports.processPostTitle = (rTitle) => {
    let titleNoWhitespace = rTitle.replace(/\s/g, '')
    let numNonWsChars = titleNoWhitespace.length
    let wsCompressedTitle = rTitle.replace(/\s+/g, ' ').trim()
    let error = null

    if(rTitle.length === 0) {
        error = {'msg': 'Please fill in a title'}
    }
    else if(numNonWsChars < 4) {
        error = {'msg': 'Title must be at least 4 characters'}
    }
    else if(wsCompressedTitle.length > 160) {
        error = {'msg': 'Title can\'t be more than 160 characters'}
    }

    //
    return [wsCompressedTitle, error]
}

//
exports.processPostTags = (rTags) => {
    let tags = rTags.split(',')
    let trimTags = []
    let errors = []

    for(let i = 0; i < tags.length; ++i) {
        let trimTag = tags[i].trim().toLowerCase()

        if(trimTag !== "" && trimTags.indexOf(trimTag) == -1) {
            trimTags.push(trimTag)
        }
    }

    //
    let isCharError = false
    let isLenError = false

    for(let i = 0; i < trimTags.length; ++i) {
        let isMatch = trimTags[i].match(/^[0-9a-zA-Z-]+$/)

        if(!isCharError && isMatch === null) {
            errors.push({'msg': 'group names can only contain numbers, letters and dashes'})
            isCharError = true
        }

        let tagLen = trimTags[i].length
        let isLenOkay = tagLen >= 3 && tagLen <= 20

        if(!isLenError && !isLenOkay) {
            errors.push({'msg': 'each group name must be 3-20 characters'})
            isLenError = true
        }
    }

    //
    if(trimTags.length > 4) {
        errors.push({'msg': 'the max tags per post is 4'})
    }

    //
    return [trimTags, errors]
}
