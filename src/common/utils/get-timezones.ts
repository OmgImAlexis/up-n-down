import { query } from '../../db.js';
import { sql } from '../sql-tag.js';

export const getTimezones = () => query<{ name: string; utc_offset: number; }>(sql('get-timezones')`
    select
        name,
        utc_offset
    from
        pg_timezone_names
    where
        name not like 'Etc/%' and
        name not like 'GMT%' and
        name not like 'posix%'
    order by
        utc_offset, name`,
).then(({ rows }) => rows);
