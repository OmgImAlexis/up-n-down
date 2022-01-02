import { getUserAllPrivateGroupIds } from '../get-user-all-private-group-ids.js';

export const isUserAllowedToViewPost = async (postPrivateIds: string[], userId: number) => {
	const privateIds = await getUserAllPrivateGroupIds(userId);

	// Check that the post's IDs are a subset of the user's IDs
	return postPrivateIds.every(v => privateIds.includes(v));
};
