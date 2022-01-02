import type { Request, Response } from 'express';
import { deleteCachedEvent } from '../../../common/firehose.js';

export const deleteNotification = async (request: Request, response: Response) => {
	deleteCachedEvent(request.session.user.user_id, request.params.id);
	response.sendStatus(200);
};
