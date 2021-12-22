import { query } from '../db/index.js';

export const getTimeZones = () => query(`
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
        utc_offset, name`
).then(({ rows }) => rows);
