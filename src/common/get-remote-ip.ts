import type { Request } from 'express';

export const getRemoteIp = (request: Request) => process.env.TRUST_PROXY ? (request.headers['x-forwarded-for'] ?? request.socket.remoteAddress) : request.socket.remoteAddress;
