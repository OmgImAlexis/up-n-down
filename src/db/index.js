import argon2 from 'argon2';
import { eyesDefaultUsername } from '../config/index.js';
import postgres from 'pg';

const { Pool, types } = postgres;

// Use raw timestamp instead of converting to a js Date object
types.setTypeParser(1114, str => str)

const pool = new Pool();

export const query = (query, params) => {
    // console.log(query);
    return pool.query(query, params);
}



// exports.getUsersWithoutPublicId = () => {
//     return query(`
//         select
//             user_id
//         from
//             tuser
//         where
//             public_id = ''`)
// }


// //
// exports.genUserPublicId = (userId) => {
//     return query(`
//         update
//             tuser
//         set
//             public_id = $1
//         where
//             user_id = $2 and
//             public_id = ''`,
//         [
//             generateNanoId(nanoidAlphabet, nanoidLen),
//             userId
//         ])
// }





// exports.getPostLinks = () => {
//     return query(`
//         select
//             post_id,
//             link
//         from
//             tpost
//         where
//             link is not null`)
// }




// exports.updatePostDomainNameId = (postId, domainNameId) => {
//     return query(`
//         update
//             tpost
//         set
//             domain_name_id = $1
//         where
//             post_id = $2`,
//         [domainNameId, postId])
// }

// exports.setLastCommentTimes = () => {
//     return query(`
//         update
//             tpost p
//         set
//             last_comment = (
//                 select
//                     max(created_on)
//                 from
//                     ttest
//                 where
//                     post_id = p.post_id
//             )`,
//         [])
// }


// exports.getDomainName = (domainName) => {
//     return query(`
//         select
//             domain_name_id
//         from
//             tdomainname
//         where
//             domain_name = $1`,
//         [domainName])
// }






// exports.getInboxComments = (timeZone, userId, isDiscoverMode, filterUserId, page) => {
//     const pageSize = 20

//     return query(`
//         select
//             c.text_content,
//             c.path,
//             u.username,
//             u.user_id,
//             u.public_id as user_public_id,
//             to_char(
//                 timezone($1, c.created_on),
//                 'Mon FMDD, YYYY FMHH12:MIam') created_on,
//             c.public_id,
//             c.is_removed,
//             u.user_id = $2 or u.user_id = $3 or
//                 exists(select
//                     1
//                 from
//                     tfollower
//                 where
//                     followee_user_id = u.user_id and
//                     user_id = $4) is_visible,
//             exists(select
//                     1
//                 from
//                     tfollower
//                 where
//                     followee_user_id = u.user_id and
//                     user_id = $5) is_follow
//         from
//             ttest c
//         join
//             tuser u on u.user_id = c.user_id
//         join
//             tpost p on p.post_id = c.post_id
//         where
//             (
//                 (nlevel(c.path) = 2 and p.user_id = $6) or
//                 (nlevel(c.path) > 2 and (select user_id from ttest where path = subpath(c.path, 0, -1)) = $7)
//             ) and
//             ($8 or c.user_id = $9 or c.user_id = $10 or
//                 exists(select
//                     1
//                 from
//                     tfollower
//                 where
//                     followee_user_id = c.user_id and
//                     user_id = $11))
//         order by
//             c.created_on desc
//         limit
//             $12
//         offset
//             $13`,
//         [timeZone, userId, filterUserId, filterUserId, userId, userId, userId,
//             isDiscoverMode, userId, filterUserId, filterUserId, pageSize, (page - 1)*pageSize])
// }



// //private group member
// exports.createGroupMember = (groupId, userId) => {
//     return query(`
//         insert into tgroupmember
//             (private_group_id, user_id)
//         values
//             ($1, $2)`,
//         [groupId, userId])
// }

// exports.getGroupMember = (groupId, userId) => {
//     return query(`
//         select
//             group_member_id
//         from
//             tgroupmember
//         where
//             private_group_id = $1 and
//             user_id = $2`,
//         [groupId, userId]
//     )
// }



// exports.deleteGroupMember = (privateGroupId, publicUserId) => {
//     return query(`
//         delete from
//             tgroupmember gm
//         using
//             tuser u
//         where
//             u.public_id = $1 and
//             gm.private_group_id = $2 and
//             u.user_id = gm.user_id`,
//         [publicUserId, privateGroupId]
//     )
// }


