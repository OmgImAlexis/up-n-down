import { deleteCachedEvent } from '../../../common/firehouse.js';

export const deleteNotification = async (req, res) => {
	deleteCachedEvent(req.session.user.user_id, req.params.id);
	res.send('done');
};
