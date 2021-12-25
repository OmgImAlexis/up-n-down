import sql from 'sql-tag';
import { query } from '../db/index.js';
import { getUserAllPrivateGroupIds } from './get-user-all-private-group-ids.js';

// @todo: very similar to getPosts(), may want to combine
export const getTagPosts = async (userId, timezone, page, tag, isDiscoverMode, filterUserId, sort) => {
    const pageSize = 20;
    const allowedPrivateIds = userId === -1 ? [] : await getUserAllPrivateGroupIds(userId);
    return query(sql`
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
                    tfollower
                WHERE
                    followee_user_id = u.user_id and
                    user_id = ${filterUserId}) is_visible,
            EXISTS(SELECT
                1
            FROM
                tfollower
            WHERE
                followee_user_id = u.user_id and
                user_id = ${userId}) is_follow,
            array(
                SELECT
                    t.tag
                FROM
                    ttag t
                JOIN
                    tposttag pt on pt.tag_id = t.tag_id
                WHERE
                    pt.post_id = p.post_id
            ) as tags
        FROM
            tpost p
        JOIN
            tuser u on u.user_id = p.user_id
        LEFT JOIN
            tdomainname dn on dn.domain_name_id = p.domain_name_id
        WHERE
            NOT is_removed AND
            EXISTS(
                SELECT
                    1
                FROM
                    ttag t
                JOIN
                    tposttag pt on pt.tag_id = t.tag_id
                WHERE
                    t.tag = ${tag} and
                    pt.post_id = p.post_id
            ) and
            (${isDiscoverMode} or u.user_id = ${userId} or u.user_id = ${filterUserId} or
                EXISTS(SELECT
                    1
                FROM
                    tfollower
                WHERE
                    followee_user_id = u.user_id and
                    user_id = ${filterUserId})) and
            (array(
                SELECT
                    pg.private_group_id
                FROM
                    tprivategroup pg
                JOIN
                    ttag t on t.tag = pg.name
                JOIN
                    tposttag pt on pt.tag_id = t.tag_id
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
            ${pageSize}
        OFFSET
            ${(page - 1) * pageSize}
    `);
};