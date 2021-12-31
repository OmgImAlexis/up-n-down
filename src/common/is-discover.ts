import type Express from 'express';
import { getCurrentPostMode } from './settings/get-current-post-mode.js';

export const isDiscover = (request: Express.Request) => getCurrentPostMode(request) === 'discover';
