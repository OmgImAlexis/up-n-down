/**
 * Get the current post mode for this request
 * @param {import('express').Request} req
 * @returns
 */
export const getCurrPostMode = req => {
    if (req.session.user) return req.session.user.post_mode ?? 'discover';
    return req.cookies.post_mode ?? 'discover';
};
