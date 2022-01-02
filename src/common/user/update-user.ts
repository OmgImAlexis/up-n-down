import type { SiteSettings } from '../../types/site';
import { query } from '../../db.js';
import { sql } from '../sql-tag';

export const updateUser = (userId: number, settings: SiteSettings) => query(sql('update-user')`
    UPDATE
        "user"
    SET
        time_zone = ${settings.timezone},
        post_mode = ${settings.postMode},
        comment_reply_mode = ${settings.commentReplyMode},
        eyes = ${settings.eyes},
        site_width = ${settings.siteWidth}
    WHERE
        user_id = ${userId}
`);
