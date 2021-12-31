import { Session } from 'express-session';

interface User {
    user_id: number;
    post_mode: 'discover';
}

declare namespace Express {
    export interface Request {
        /**
         * The request's ID.
         */
        id: string;
    }
}

declare module 'express-session' {
    interface Session {
        user: User;
    }
}
