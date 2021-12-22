/**
 * Process a title
 * @param {string} title
 * @returns
 */
export const processPostTitle = (title) => {
    const titleNoWhitespace = title.replace(/\s/g, '');
    const numNonWsChars = titleNoWhitespace.length;
    const wsCompressedTitle = title.replace(/\s+/g, ' ').trim();

    // Bail if there's no title
    if (title.length === 0) throw new Error('Please fill in a title');

    // Bail if the title is too short
    if (numNonWsChars < 4) throw new Error('Title must be at least 4 characters');

    // Bail if the title is too long
    if (wsCompressedTitle.length > 160) throw new Error('Title can\'t be more than 160 characters');

    // Return title
    return wsCompressedTitle;
};
