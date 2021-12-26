import { getCurrentEyesId } from '../../common/settings/get-current-eyes-id.js';
import { isDiscover } from '../../common/is-discover.js';
import { getInboxComments } from '../../common/get-inbox-comments.js';
import { getCurrentTimezone } from '../../common/settings/get-current-timezone.js';
import { getCurrentCommentReplyMode } from '../../common/settings/get-current-comment-reply-mode.js';

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

		const filterUserId = await getCurrentEyesId(req);
		const isDiscoverMode = isDiscover(req);

		// Get the requested page or fall back to 1
		const requestedPage = Array.isArray(req.query.p) ? req.query.p[0] : req.query.p;
		const page = parseInt(requestedPage?.toString() ?? '1', 10);

		//
		const comments = await getInboxComments(
			getCurrentTimezone(req),
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
			comment_reply_mode: getCurrentCommentReplyMode(req),
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
