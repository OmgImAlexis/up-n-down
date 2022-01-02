import { Session } from 'express-session';
import { SiteSettings } from '../site';

interface User {
    user_id: number;
    username: string;
    time_zone: string;
    post_mode: string;
    comment_reply_mode: string;
    site_width: number;
}

declare global{
    namespace Express {
        interface Request {
            /**
             * The request's ID.
             */
            id: string;
        }
    }
}

declare module 'express-session' {
    interface SessionData {
        user: User & Partial<SiteSettings>;
    }
}

declare module 'express-serve-static-core' {
    interface Request {
        cookies: {
            user_id: string;
        }
    }
}