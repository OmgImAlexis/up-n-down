export type SiteSettings<T = unknown> = {
    timezone: string;
    is_discover_mode: boolean;
    filter_user_id: number;
    sort: string;
    comment_reply_mode: string;
    post_mode: string;
    eyes: number;
    site_width: number;
} & T;
