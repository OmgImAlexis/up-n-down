import { query } from '../db.js';
import { postsPerPage } from '../config.js';
import { getUserAllPrivateGroupIds } from './get-user-all-private-group-ids.js';
import { sql } from './sql-tag.js';
import { SiteSettings } from 'src/types/site.js';

// @todo: very similar to getPosts(), may want to combine
export const getTagPosts = async (userId: number, {
	timezone, page, tag, isDiscoverMode, filterUserId, sort,
}: SiteSettings<{ page: number; tag: string; }>) => {
	const allowedPrivateIds = userId === -1 ? [] : await getUserAllPrivateGroupIds(userId);
	return query<{
        public_id: string;
        title: string;
        created_on: string;
        username: string;
        user_id: string;
        user_public_id: string;
        link: string;
        num_comments: number;
        domain_name: string;
        is_visible: boolean;
        is_follow: boolean;
        tags: string[];
    }>(sql('get-tag-posts')`
        SELECT
            p.public_id,
            p.title,
            to_char(
                timezone(${timezone}, p.created_on),
                'Mon FMDD, YYYY FMHH12:MIam') created_on,
            u.username,
            u.user_id,
            u.public_id as user_public_id,
            p.link,
            p.num_comments,
            dn.domain_name,
            u.user_id = ${userId} or u.user_id = ${filterUserId} or
                EXISTS(SELECT
                    1
                FROM
                    follower
                WHERE
                    followee_user_id = u.user_id and
                    user_id = ${filterUserId}) is_visible,
            EXISTS(SELECT
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
        FROM
            post p
        JOIN
            "user" u on u.user_id = p.user_id
        LEFT JOIN
            domainname dn on dn.domain_name_id = p.domain_name_id
        WHERE
            NOT is_removed AND
            EXISTS(
                SELECT
                    1
                FROM
                    tag t
                JOIN
                    posttag pt on pt.tag_id = t.tag_id
                WHERE
                    t.tag = ${tag} and
                    pt.post_id = p.post_id
            ) and
            (${isDiscoverMode} or u.user_id = ${userId} or u.user_id = ${filterUserId} or
                EXISTS(SELECT
                    1
                FROM
                    follower
                WHERE
                    followee_user_id = u.user_id and
                    user_id = ${filterUserId})) and
            (array(
                SELECT
                    pg.private_group_id
                FROM
                    privategroup pg
                JOIN
                    tag t on t.tag = pg.name
                JOIN
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
            ${(page - 1) * postsPerPage}
    `).then(({ rows }) => rows);
};
