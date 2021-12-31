import type { Request, Response } from 'express';

export const renderPage = (name: string, props: Record<string, unknown>) => (_request: Request, response: Response) => response.render(name, props);
