import type { Request, Response } from 'express';

export const getSettingsUsername = async (request: Request, response: Response) => {
	// If the user is logged out redirect them to the main settings page
	if (!request.session.user) {
		return response.redirect('/settings');
	}

	// Render the username settings page
	response.render('my-settings-username', {
		html: {
			title: 'Settings / Username',
		},
		username: request.session.user.username,
	});
};
