import type Express from 'express';

export const getRemoteIp = (request: Express.Request) => process.env.TRUST_PROXY ? (request.headers['x-forwarded-for'] ?? request.socket.remoteAddress) : request.socket.remoteAddress;
