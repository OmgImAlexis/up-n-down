/**
 * Get the current comment reply mode for this request
 * @param {import('express').Request} req
 * @returns
 */
export const getCurrentCommentReplyMode = req => {
    const defaultReplyMode = 'quick';
    if (req.session.user) return req.session.user.comment_reply_mode ?? defaultReplyMode;
    return defaultReplyMode;
};
