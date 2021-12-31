import { deleteCachedEvent } from '../../../common/firehose.js';

export const deleteNotification = async (req, res) => {
	deleteCachedEvent(req.session.user.user_id, req.params.id);
	res.sendStatus(200);
};
