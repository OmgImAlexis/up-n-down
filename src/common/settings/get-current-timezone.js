/**
 * Get the current timezone name
 * @param {import('express').Request} req
 * @returns string
 */

export const getCurrentTimezone = (req) => {
    const timeZone = req.session.user ? req.session.user.time_zone : req.cookies.time_zone;
    return timeZone ?? 'UTC';
};
