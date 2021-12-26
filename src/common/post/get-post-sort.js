/**
 * Ge the post sort
 * @param {import('express').Request} req
 * @returns
 */
export const getPostSort = req => {
	const validSortValues = ['oldest', 'comments', 'last'];
	if (validSortValues.includes(req.query.sort)) {
		return req.query.sort;
	}

	return '';
};
