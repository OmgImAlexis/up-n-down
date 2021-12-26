/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns
 */
export const getInbox = async (req, res) => {
	try {
		if (!req.session.user) {
			throw new Error('<a href="/login">Log in</a> to view your inbox.');
		}

		const filterUserId = await getCurrEyesId(req);
		const isDiscoverMode = isDiscover(req);

		// Get the requested page or fall back to 1
		const requestedPage = Array.isArray(req.query.p) ? req.query.p[0] : req.query.p;
		const page = parseInt(requestedPage?.toString() ?? '1', 10);

		//
		const comments = await getInboxComments(
			getCurrentTimeZone(req),
			req.session.user.user_id,
			isDiscoverMode,
			filterUserId,
			page);

		// Render inbox
		res.render('inbox', {
			html: {
				title: 'Inbox',
			},
			comments,
			page,
			isDiscoverMode,
			comment_reply_mode: myMisc.getCurrCommentReplyMode(req),
		});
	} catch (error) {
		res.render('inbox', {
			html: {
				title: 'Inbox',
			},
			error,
		});
	}
};
