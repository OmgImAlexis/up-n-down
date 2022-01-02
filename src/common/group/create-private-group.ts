import { query } from '../../db.js';
import { sql } from '../sql-tag.js';

export const createPrivateGroup = (groupName: string, userId: number) => query(sql('create-private-group')`
    INSERT INTO privategroup (created_by, "name")
        VALUES (${userId}, ${groupName})
`).then(({ rows: [group] }) => group);
