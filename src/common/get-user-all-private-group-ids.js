import { query } from '../db/index.js';

/**
 * 
 * @param {string} userId The user's ID.
 * @returns 
 */
export const getUserAllPrivateGroupIds = (userId) => query(`
        SELECT
            private_group_id
        FROM
            tprivategroup
        WHERE
            created_by = ${userId}

        UNION

        SELECT
            pg.private_group_id
        FROM
            tprivategroup pg
        JOIN
            tgroupmember gm on gm.private_group_id = pg.private_group_id
        WHERE
            gm.user_id = ${userId}
`);