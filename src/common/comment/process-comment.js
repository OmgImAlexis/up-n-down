/**
 * Process a comment
 * @param {string} comment
 * @returns
 */
export const processComment = text => {
	// Remove leading and trailing spaces
	const comment = text.trim();

	// Bail if there's no comment
	if (comment.length === 0) {
		throw new Error('Please fill in a comment');
	}

	// Bail if the comment is too short
	if (comment.length < 1) {
		throw new Error('Your comment must be at least 1 character');
	}

	// Return comment
	return comment;
};
