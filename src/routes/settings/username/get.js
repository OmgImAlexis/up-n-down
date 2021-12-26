/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns
 */
export const getSettingsUsername = async (req, res) => {
	// If the user is logged out redirect them to the main settings page
	if (!req.session.user) {
		return res.redirect('/settings');
	}

	// Render the username settings page
	res.render('my-settings-username', {
		html: {
			title: 'Settings / Username',
		},
		username: req.session.user.username,
	});
};
