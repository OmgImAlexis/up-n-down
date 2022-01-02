import type { Request } from 'express';

const validSortValues = ['oldest', 'comments', 'last', ''] as const;

/**
 * Get the post sort
 */
export const getPostSort = (request: Request<unknown, unknown, unknown, { sort?: typeof validSortValues[number] }>): typeof validSortValues[number] => {
	if (request.query.sort && validSortValues.includes(request.query.sort)) {
		return request.query.sort;
	}

	return '';
};
