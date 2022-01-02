import type { Request } from 'express';

/**
 * Get the current timezone name
 */
export const getCurrentTimezone = (request: Request) => {
	const timezone = request.session.user?.time_zone ?? request.cookies.time_zone;
	return timezone ?? 'UTC';
};
