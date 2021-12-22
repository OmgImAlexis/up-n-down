import { getCurrPostMode } from './get-current-post-mode.js';

/**
 *
 * @param {import('express').Request} req
 * @returns
 */
export const isDiscover = req => getCurrPostMode(req) === 'discover' ? 1 : 0;
