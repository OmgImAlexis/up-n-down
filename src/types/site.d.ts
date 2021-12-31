export type SiteSettings<T = unknown> = {
    timezone: string;
    isDiscoverMode: boolean;
    filterUserId: string;
    sort: string;
} & T;