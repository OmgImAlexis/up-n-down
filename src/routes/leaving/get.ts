import type { Request, Response } from 'express';
import { tall } from 'tall';
import cacheManager from 'cache-manager';

const cache = cacheManager.caching({
	store: 'memory',
	max: 100,
	ttl: 30, // Seconds
});

export const getLeaving = async (request: Request, response: Response) => {
	const requestedGoto = typeof request.query.goto === 'string' ? request.query.goto : '';
	const requestedRaw = Boolean(request.query.raw);

	// If the user wants raw then return the original address
	// Otherwise get the resolved address from cache or resolve the address
	const goto = requestedRaw ? requestedGoto : (await cache.get(requestedGoto) ?? await tall(requestedGoto, {
		method: 'HEAD',
		maxRedirects: 10,
	}));

	// Redirect to homepage if goto is missing
	if (!goto) {
		return response.redirect('/');
	}

	// Update cache with newly resolved address
	cache.set(requestedGoto, goto);

	// Render page
	response.render('leaving', {
		goto,
	});
};
