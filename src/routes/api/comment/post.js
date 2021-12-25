import { dirname, join as joinPath } from 'path';
import { fileURLToPath } from 'url';
import { compileFile } from 'pug';
import { HttpError } from '../../../errors/http-error.js';
import { getCommentWithPublicId } from '../../../common/comment/get-comment-with-public-id.js';
import { isUserAllowedToViewPost } from '../../../common/post/is-user-allowed-to-view-post.js';
import { processComment } from '../../../common/comment/process-comment.js';
import { createCommentComment } from '../../../common/comment/create-comment-comment.js';
import { increasePostNumberOfComments } from '../../../common/post/increase-post-number-of-comments.js';
import { getCurrentTimezone } from '../../../common/get-current-timezone.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const postComment = async (req, res) => {
    // Bail if they're not authenticated
    if (!req.session.user) throw new HttpError('Unauthorized', 401);

    // Bail if the comment doesn't exist
    const comment = await getCommentWithPublicId(req.body.commentid);
    if (!comment) throw new HttpError('Not Found', 404);
   
    // Bail if they if they don't have permission
    const isAllowed = await isUserAllowedToViewPost(comment.private_group_ids, req.session.user.user_id);
    if(!isAllowed) throw new HttpError('Forbidden', 403);

    // Trim the comment
    const trimmedComment = processComment(req.body.text_content);

    // Create the reply
    const reply = await createCommentComment(comment.post_id, req.session.user.user_id, trimmedComment, comment.path, getCurrentTimezone(req));

    // Increase number of comments on the associated post
    await increasePostNumberOfComments(comment.post_id);

    // 
    res.json({
        ...reply,
        text_content: compileFile(joinPath(__dirname, '../../../views/bbCodesOnly.pug'))({ text: reply.text_content }),
        by: req.session.user.username
    });
}