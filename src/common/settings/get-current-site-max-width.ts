import type { Request } from 'express';

export const getCurrentSiteMaxWidth = (request: Request) => {
	const defaultValue = 600;

	if (request.session.user) {
		return request.session.user.site_width ?? defaultValue;
	}

	if (!request.cookies.site_width) {
		return defaultValue;
	}

	if (request.cookies.site_width === '') {
		return null;
	}

	const siteWidth = parseInt(request.cookies.site_width, 10);

	if (isNaN(siteWidth)) {
		return defaultValue;
	}

	if (siteWidth < 500 || siteWidth > 1000) {
		return defaultValue;
	}

	return siteWidth;
};
