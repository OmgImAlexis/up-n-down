/**
 *
 * @param {import('express').Request} req
 * @returns
 */
export const getCurrentSiteMaxWidth = req => {
	const defaultValue = 600;

	if (req.session.user) {
		return req.session.user.site_width ?? defaultValue;
	}

	if (!req.cookies.site_width) {
		return defaultValue;
	}

	if (req.cookies.site_width === '') {
		return null;
	}

	const siteWidth = parseInt(req.cookies.site_width, 10);

	if (isNaN(siteWidth)) {
		return defaultValue;
	}

	if (siteWidth < 500 || siteWidth > 1000) {
		return defaultValue;
	}

	return siteWidth;
};
