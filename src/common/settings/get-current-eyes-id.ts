import type { Request } from 'express';
import { getUserWithUsername } from '../user/get-user-with-username.js';
import { eyesDefaultUsername } from '../../config.js';

/**
 * Get the current eyes.
 */
export const getCurrentEyesId = async (request: Request) => {
	if (request.session.user) {
		return request.session.user.eyes ?? request.session.user.user_id;
	}

	if (request.cookies.eyes === '') {
		return -1;
	}

	const user = await getUserWithUsername(request.cookies.eyes ?? eyesDefaultUsername);
	return user?.is_eyes ? user.user_id : -1;
};
