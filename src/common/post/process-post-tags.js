/**
 *
 * @param {string} postTags
 * @returns
 */
export const processPostTags = (postTags) => {
    const tags = postTags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => Boolean(tag));

    // Only allow a max of 4 tags
    if (tags.length > 4) throw new Error('the max tags per post is 4');

    // Validate each tag
    for (const tag of tags) {
        if (!tag.match(/^[0-9a-zA-Z-]+$/)) throw new Error('tags can only contain numbers, letters and dashes.');
        if (tag.length < 3 || tag.length > 20) throw new Error('each tag must be 3-20 characters');
    }

    return tags;
};
