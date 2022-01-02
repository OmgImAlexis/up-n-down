import type { Request } from 'express';

export const getPageNumber = (request: Request) => {
    const query = typeof request.query.p === 'string' ? request.query.p : '';
    const requestedPage = parseInt(query, 10);
    return isNaN(requestedPage) ? 1 : requestedPage;
};

