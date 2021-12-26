import { query } from '../../db/index.js';
import { getUserAllPrivateGroupIds } from '../get-user-all-private-group-ids.js';

/**
 *
 * @param {string} userId The user's ID.
 * @param {string} timeZone The timezone for the current session.
 * @param {number} page The page number.
 * @param {boolean} isDiscoverMode Is discovery mode enabled.
 * @param {string} filterUserId
 * @param {*} sort
 * @returns
 */
export const getPosts = async (userId, timeZone, page, isDiscoverMode, filterUserId, sort) => {
	const pageSize = 20;
	const numLeadingPlaceholders = 9;
	const allowedPrivateIds = [];
	const dynamicPlaceholders = [];

	if (userId !== -1) {
		//
		const privateGroupIds = await getUserAllPrivateGroupIds(userId);

		for (const private_group_id of privateGroupIds) {
			allowedPrivateIds.push(private_group_id);
		}

		for (let i = 1; i <= allowedPrivateIds.length; ++i) {
			const placeholderNum = numLeadingPlaceholders + i;
			dynamicPlaceholders.push(`$${placeholderNum}`);
		}
	}

	const pAfter = numLeadingPlaceholders + allowedPrivateIds.length + 1;

	const beforeParams = [timeZone,
		userId,
		filterUserId,
		filterUserId,
		userId,
		isDiscoverMode,
		userId,
		filterUserId,
		filterUserId];

	const afterParams = [sort,
		sort,
		sort,
		sort,
		sort,
		sort,
		pageSize,
		((page < 1 ? 1 : page) - 1) * pageSize];

	const finalParams = beforeParams.concat(allowedPrivateIds, afterParams);

	return query(`
        SELECT
            p.public_id,
            p.title,
            to_char(
                timezone($1, p.created_on),
                'Mon FMDD, YYYY FMHH12:MIam') created_on,
            p.created_on created_on_raw,
            u.username,
            u.user_id,
            u.public_id as user_public_id,
            p.link,
            p.num_comments,
            dn.domain_name,
            u.user_id = $2 or u.user_id = $3 or
                exists(SELECT
                    1
                FROM
                    tfollower
                WHERE
                    followee_user_id = u.user_id and
                    user_id = $4) is_visible,
            exists(select
                1
            FROM
                tfollower
            WHERE
                followee_user_id = u.user_id and
                user_id = $5) is_follow,
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
        from
            tpost p
        join
            tuser u on u.user_id = p.user_id
        left join
            tdomainname dn on dn.domain_name_id = p.domain_name_id
        where
            not is_removed and
            ($6 or u.user_id = $7 or u.user_id = $8 or
                exists(select
                    1
                from
                    tfollower
                where
                    followee_user_id = u.user_id and
                    user_id = $9)) and
            (array(
                select
                    pg.private_group_id
                from
                    tprivategroup pg
                join
                    ttag t on t.tag = pg.name
                join
                    tposttag pt on pt.tag_id = t.tag_id
                where
                    pt.post_id = p.post_id) <@ Array[${dynamicPlaceholders.join()}]::integer[])
        ORDER BY
            case when $${pAfter} = '' then p.created_on end desc,

            case when $${pAfter + 1} = 'oldest' then p.created_on end asc,

            case when $${pAfter + 2} = 'comments' then p.num_comments end desc,
            case when $${pAfter + 3} = 'comments' then p.created_on end desc,

            case when $${pAfter + 4} = 'last' then p.last_comment end desc nulls last,
            case when $${pAfter + 5} = 'last' then p.created_on end desc
        LIMIT
            $${pAfter + 6}
        OFFSET
            $${pAfter + 7}`,
	finalParams,
	).then(({ rows }) => rows);
};
