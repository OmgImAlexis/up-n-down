/**
 * Process a title
 */
export const processPostTitle = (title: string): string => {
	const characterCount = title.replace(/\s/g, '').length;
	const trimmedTitle = title.replace(/\s+/g, ' ').trim();

	// Bail if there's no title
	if (characterCount === 0) {
		throw new Error('Please fill in a title');
	}

	// Bail if the title is too short
	if (characterCount < 4) {
		throw new Error('Title must be at least 4 characters');
	}

	// Bail if the title is too long
	if (trimmedTitle.length > 160) {
		throw new Error('Title can\'t be more than 160 characters');
	}

	// Return title
	return trimmedTitle;
};
