import type Express from 'express';

const validSortValues = ['oldest', 'comments', 'last', ''] as const;

/**
 * Get the post sort
 */
export const getPostSort = (request: Express.Request<unknown, unknown, unknown, { sort?: typeof validSortValues[number] }>): 'oldest' | 'comments' | 'last' | '' => {
	if (request.query.sort && validSortValues.includes(request.query.sort)) {
		return request.query.sort;
	}

	return '';
};
