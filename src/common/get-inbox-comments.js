import { query } from '../db/index.js';

export const getInboxComments = (timezone, userId, isDiscoverMode, filterUserId, page) => {
	const pageSize = 20;

	return query(`
        select
            c.text_content,
            c.path,
            u.username,
            u.user_id,
            u.public_id as user_public_id,
            to_char(
                timezone($1, c.created_on),
                'Mon FMDD, YYYY FMHH12:MIam') created_on,
            c.public_id,
            c.is_removed,
            u.user_id = $2 or u.user_id = $3 or
                exists(select
                    1
                from
                    follower
                where
                    followee_user_id = u.user_id and
                    user_id = $4) is_visible,
            exists(select
                    1
                from
                    follower
                where
                    followee_user_id = u.user_id and
                    user_id = $5) is_follow
        from
            comment c
        join
            "user" u on u.user_id = c.user_id
        join
            post p on p.post_id = c.post_id
        where
            (
                (nlevel(c.path) = 2 and p.user_id = $6) or
                (nlevel(c.path) > 2 and (select user_id from comment where path = subpath(c.path, 0, -1)) = $7)
            ) and
            ($8 or c.user_id = $9 or c.user_id = $10 or
                exists(select
                    1
                from
                    follower
                where
                    followee_user_id = c.user_id and
                    user_id = $11))
        order by
            c.created_on desc
        limit
            $12
        offset
            $13`,
	[timezone,
		userId,
		filterUserId,
		filterUserId,
		userId,
		userId,
		userId,
		isDiscoverMode,
		userId,
		filterUserId,
		filterUserId,
		pageSize,
		(page - 1) * pageSize]);
};
