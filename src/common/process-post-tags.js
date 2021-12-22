/**
 *
 * @param {string} rTags
 * @returns
 */
export const processPostTags = (rTags) => {
    let tags = rTags.split(',');
    let trimTags = [];
    let errors = [];

    for (const i = 0; i < tags.length; ++i) {
        const trimTag = tags[i].trim().toLowerCase();

        if (trimTag !== "" && trimTags.indexOf(trimTag) == -1) {
            trimTags.push(trimTag);
        }
    }

    //
    let isCharError = false;
    let isLenError = false;

    for (let i = 0; i < trimTags.length; ++i) {
        let isMatch = trimTags[i].match(/^[0-9a-zA-Z-]+$/);

        if (!isCharError && isMatch === null) {
            errors.push({ 'msg': 'group names can only contain numbers, letters and dashes' });
            isCharError = true;
        }

        let tagLen = trimTags[i].length;
        let isLenOkay = tagLen >= 3 && tagLen <= 20;

        if (!isLenError && !isLenOkay) {
            errors.push({ 'msg': 'each group name must be 3-20 characters' });
            isLenError = true;
        }
    }

    //
    if (trimTags.length > 4) {
        errors.push({ 'msg': 'the max tags per post is 4' });
    }

    //
    return [trimTags, errors];
};
