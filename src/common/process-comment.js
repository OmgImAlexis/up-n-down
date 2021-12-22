/**
 * Process a comment
 * @param {string} rawText
 * @returns
 */
export const processComment = (rawText) => {
    const noWhitespace = rawText.replace(/\s/g, '');
    const numNonWsChars = noWhitespace.length;
    const compressedText = rawText.trim();

    // Bail if there's no comment
    if (rawText.length === 0) return [compressedText, [{ 'msg': 'Please fill in a comment' }]];

    // Bail if the comment is too short
    if (numNonWsChars < 1) return [compressedText, [{ 'msg': 'Comment must be at least 1 character' }]];

    // Return comment
    return [compressedText, []];
};
