import sql from 'sql-tag';
import { query } from '../../db/index.js';

/**
 * 
 * @param {string} timezoneName 
 * @returns 
 */
export const getTimezoneWithName = (timezoneName) => query(sql`
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
