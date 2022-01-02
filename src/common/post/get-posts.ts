import { sql } from '../sql-tag.js';
import { postsPerPage } from '../../config.js';
import { query } from '../../db.js';
import { getUserAllPrivateGroupIds } from '../get-user-all-private-group-ids.js';

/**
 *
 * @param userId The user's ID.
 * @param timezone The timezone for the current session.
 * @param page The page number.
 * @param isDiscoverMode Is discovery mode enabled.
 * @param filterUserId
 * @param sort
 * @returns
 */
export const getPosts = async (userId: number, timezone: string, page: number, isDiscoverMode: boolean, filterUserId: number, sort: 'oldest' | 'comments' | 'last' | '') => {
	const allowedPrivateIds = userId === -1 ? [] : await getUserAllPrivateGroupIds(userId);

	return query<{
        public_id: string;
        title: string;
        created_on: string;
        created_on_raw: string;
        username: string;
        user_id: number;
        user_public_id: string;
        link?: string;
        num_comments: number;
        domain_name: string;
        is_visible: boolean;
        is_follow: boolean;
        tags: string[];
    }>(sql('get-posts')`
        SELECT
            p.public_id,
            p.title,
            to_char(
                timezone(${timezone}, p.created_on),
                'Mon FMDD, YYYY FMHH12:MIam') created_on,
            p.created_on created_on_raw,
            u.username,
            u.user_id,
            u.public_id as user_public_id,
            p.link,
            p.num_comments,
            dn.domain_name,
            u.user_id = ${userId} or u.user_id = ${filterUserId} or
                exists(SELECT
                    1
                FROM
                    follower
                WHERE
                    followee_user_id = u.user_id and
                    user_id = ${filterUserId}) is_visible,
            exists(select
                1
            FROM
                follower
            WHERE
                followee_user_id = u.user_id and
                user_id = ${userId}) is_follow,
            array(
                SELECT
                    t.tag
                FROM
                    tag t
                JOIN
                    posttag pt on pt.tag_id = t.tag_id
                WHERE
                    pt.post_id = p.post_id
            ) as tags
        from
            post p
        join
            "user" u on u.user_id = p.user_id
        left join
            domainname dn on dn.domain_name_id = p.domain_name_id
        where
            not is_removed and
            (${isDiscoverMode} or u.user_id = ${userId} or u.user_id = ${filterUserId} or
                exists(select
                    1
                from
                    follower
                where
                    followee_user_id = u.user_id and
                    user_id = ${filterUserId})) and
            (array(
                select
                    pg.private_group_id
                from
                    privategroup pg
                join
                    tag t on t.tag = pg.name
                join
                    posttag pt on pt.tag_id = t.tag_id
                where
                    pt.post_id = p.post_id) <@ ${allowedPrivateIds.length > 0 ? allowedPrivateIds : [-1]}::integer[])
        ORDER BY
            case when ${sort} = '' then p.created_on end desc,

            case when ${sort} = 'oldest' then p.created_on end asc,

            case when ${sort} = 'comments' then p.num_comments end desc,
            case when ${sort} = 'comments' then p.created_on end desc,

            case when ${sort} = 'last' then p.last_comment end desc nulls last,
            case when ${sort} = 'last' then p.created_on end desc
        LIMIT
            ${postsPerPage}
        OFFSET
            ${((page < 1 ? 1 : page) - 1) * postsPerPage}
	`).then(({ rows }) => rows);
};
