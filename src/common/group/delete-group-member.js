import sql from 'sql-tag';
import { query } from '../../db/index.js';

/**
 *
 * @param {string} privateGroupId
 * @param {string} publicUserId
 * @returns
 */
export const deleteGroupMember = (privateGroupId, publicUserId) => query(sql`
    DELETE FROM
        tgroupmember gm
    USING
        tuser u
    WHERE
        u.public_id = ${publicUserId} and
        gm.private_group_id = ${privateGroupId} and
        u.user_id = gm.user_id
`).then(({ rows }) => rows);
