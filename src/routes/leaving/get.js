import { tall } from 'tall';
import cacheManager from 'cache-manager';

const cache = cacheManager.caching({
    store: 'memory',
    max: 100,
    ttl: 30 // seconds
});

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @returns 
 */
export const getLeaving = async (req, res) => {
    const requestedGoto = req.query.goto;
    const requestedRaw = Boolean(req.query.raw);

    // If the user wants raw then return the original address
    // Otherwise get the resolved address from cache or resolve the address
    const goto = requestedRaw ? requestedGoto : (await cache.get(requestedGoto) ?? await tall(requestedGoto, {
        method: 'HEAD',
        maxRedirects: 10
    }));

    // Redirect to homepage if goto is missing
    if (!goto) return res.redirect('/');

    // Update cache with newly resolved address
    cache.set(requestedGoto, goto);

    // Render page
    res.render('leaving', {
        goto
    });
};
