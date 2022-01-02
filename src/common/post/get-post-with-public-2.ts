import { query } from '../../db.js';
import { sql } from '../sql-tag.js';

export const getPostWithPublic2 = (publicId: string, timezone: string, userId: number, filterUserId: number) => query<{
    post_id: string;
    title: string;
    created_on: string;
    created_on_raw: string;
    text_content: string;
    username: string;
    user_id: string;
    user_public_id: string;
    public_id: string;
    link: string;
    num_comments: number;
    domain_name: string;
    is_visible: boolean;
    is_follow: boolean;
    tags: string[];
    private_group_ids: string[];
}>(sql('get-post-with-public-2')`
    SELECT
        p.post_id,
        p.title,
        to_char(
            timezone(${timezone}, p.created_on),
            'Mon FMDD, YYYY FMHH12:MIam') created_on,
        p.created_on created_on_raw,
        p.text_content,
        u.username,
        u.user_id,
        u.public_id as user_public_id,
        p.public_id,
        p.link,
        p.num_comments,
        dn.domain_name,
        u.user_id = ${userId} OR u.user_id = ${filterUserId} OR
            EXISTS(SELECT
                1
            FROM
                follower
            WHERE
                followee_user_id = u.user_id AND
                user_id = ${filterUserId}) is_visible,
        EXISTS(SELECT
                1
            FROM
                follower
            WHERE
                followee_user_id = u.user_id AND
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
        ) as tags,
        array(
            SELECT
                pg.private_group_id
            FROM
                privategroup pg
            JOIN
                tag t on t.tag = pg.name
            JOIN
                posttag pt on pt.tag_id = t.tag_id
            WHERE
                pt.post_id = p.post_id
        ) as private_group_ids
    FROM
        post p
    JOIN
        "user" u on u.user_id = p.user_id
    LEFT JOIN
        domainname dn on dn.domain_name_id = p.domain_name_id
    WHERE
        p.public_id = ${publicId} AND
        not p.is_removed
`).then(({ rows: [post] }) => post);
