import { getCurrentPostMode } from './settings/get-current-post-mode.js';

/**
 *
 * @param {import('express').Request} req
 * @returns
 */
export const isDiscover = req => getCurrentPostMode(req) === 'discover' ? 1 : 0;
