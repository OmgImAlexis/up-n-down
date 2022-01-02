import { query } from '../../db.js';
import { sql } from '../sql-tag.js';

export const updateComment = (commentId: string, textContent: string) => query<void>(sql('update-comment')`
    UPDATE
        comment
    SET
        text_content = ${textContent}
    WHERE
        comment_id = ${commentId}
`);
