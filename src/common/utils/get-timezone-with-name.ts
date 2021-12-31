import { query } from '../../db.js';
import { sql } from '../sql-tag.js';

export const getTimezoneWithName = (timezoneName: string) => query<{ name: string; abbrev: string; utc_offset: number; is_dst: boolean; }>(sql('get-timezone-with-name')`
    SELECT
        name,
        abbrev,
        utc_offset,
        is_dst
    FROM
        pg_timezone_names
    WHERE
        name = ${timezoneName}
`);
