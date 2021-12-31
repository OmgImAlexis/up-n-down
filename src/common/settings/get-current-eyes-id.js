import { getUserWithUsername } from '../user/get-user-with-username.js';
import { eyesDefaultUsername } from '../../config.js';

/**
 * Get the current eyes.
 *
 * @param {import('express').Request} req
 * @returns
 */
export const getCurrentEyesId = async req => {
	if (req.session.user) {
		return req.session.user.eyes ?? req.session.user.user_id;
	}

	if (req.cookies.eyes === '') {
		return -1;
	}

	const user = await getUserWithUsername(req.cookies.eyes ?? eyesDefaultUsername);
	return user?.is_eyes ? user.user_id : -1;
};
