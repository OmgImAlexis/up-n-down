import type { Request, Response } from 'express';
import { getCurrentEyesId } from '../../common/settings/get-current-eyes-id.js';
import { isDiscover } from '../../common/is-discover.js';
import { getInboxComments } from '../../common/get-inbox-comments.js';
import { getCurrentTimezone } from '../../common/settings/get-current-timezone.js';
import { getCurrentCommentReplyMode } from '../../common/settings/get-current-comment-reply-mode.js';
import { getPageNumber } from '../../common/get-page-number.js';

export const getInbox = async (request: Request, response: Response) => {
	try {
		if (!request.session.user) {
			throw new Error('<a href="/login">Log in</a> to view your inbox.');
		}

		const filterUserId = await getCurrentEyesId(request);
		const isDiscoverMode = isDiscover(request);
		const page = getPageNumber(request);

		//
		const comments = await getInboxComments({
			timezone: getCurrentTimezone(request),
			userId: req.session.user.user_id,
			isDiscoverMode,
			filterUserId,
			page
		});

		// Render inbox
		response.render('inbox', {
			html: {
				title: 'Inbox',
			},
			comments,
			page,
			isDiscoverMode,
			comment_reply_mode: getCurrentCommentReplyMode(request),
		});
	} catch (error) {
		response.render('inbox', {
			html: {
				title: 'Inbox',
			},
			error,
		});
	}
};
