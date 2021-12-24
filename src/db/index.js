import argon2 from 'argon2';
import { eyesDefaultUsername } from '../config/index.js';
import postgres from 'pg';

const { Pool, types } = postgres;

// Use raw timestamp instead of converting to a js Date object
types.setTypeParser(1114, str => str)

const pool = new Pool();

export const query = (query, params) => pool.query(query, params);



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




// //TODO: very similar to getPosts(), may want to combine
// exports.getTagPosts = async (userId, timeZone, page, tag, isDiscoverMode, filterUserId, sort) => {
//     let pageSize = 20
//     const numLeadingPlaceholders = 10
//     const allowedPrivateIds = []
//     const dynamicPlaceholders = []

//     if(userId != -1) {

//         //
//         const {rows} = await module.exports.getUserAllPrivateGroupIds(userId)

//         for(const i in rows) {
//             allowedPrivateIds.push(rows[i].private_group_id)
//         }

//         for(let i = 1; i <= allowedPrivateIds.length; ++i) {
//             const placeholderNum = numLeadingPlaceholders + i
//             dynamicPlaceholders.push(`$${placeholderNum}`)
//         }
//     }

//     const pAfter = numLeadingPlaceholders + allowedPrivateIds.length + 1

//     const beforeParams = [timeZone, userId, filterUserId, filterUserId, userId, tag,
//         isDiscoverMode, userId, filterUserId, filterUserId]

//     const afterParams = [sort, sort, sort, sort, sort, sort,
//         pageSize, (page - 1)*pageSize]

//     const finalParams = beforeParams.concat(allowedPrivateIds, afterParams)

//     return query(`
//         select
//             p.public_id,
//             p.title,
//             to_char(
//                 timezone($1, p.created_on),
//                 'Mon FMDD, YYYY FMHH12:MIam') created_on,
//             u.username,
//             u.user_id,
//             u.public_id as user_public_id,
//             p.link,
//             p.num_comments,
//             dn.domain_name,
//             u.user_id = $2 or u.user_id = $3 or
//                 exists(select
//                     1
//                 from
//                     tfollower
//                 where
//                     followee_user_id = u.user_id and
//                     user_id = $4) is_visible,
//             exists(select
//                 1
//             from
//                 tfollower
//             where
//                 followee_user_id = u.user_id and
//                 user_id = $5) is_follow,
//             array(
//                 select
//                     t.tag
//                 from
//                     ttag t
//                 join
//                     tposttag pt on pt.tag_id = t.tag_id
//                 where
//                     pt.post_id = p.post_id
//             ) as tags
//         from
//             tpost p
//         join
//             tuser u on u.user_id = p.user_id
//         left join
//             tdomainname dn on dn.domain_name_id = p.domain_name_id
//         where
//             not is_removed and
//             exists(
//                 select
//                     1
//                 from
//                     ttag t
//                 join
//                     tposttag pt on pt.tag_id = t.tag_id
//                 where
//                     t.tag = $6 and
//                     pt.post_id = p.post_id
//             ) and
//             ($7 or u.user_id = $8 or u.user_id = $9 or
//                 exists(select
//                     1
//                 from
//                     tfollower
//                 where
//                     followee_user_id = u.user_id and
//                     user_id = $10)) and
//             (array(
//                 select
//                     pg.private_group_id
//                 from
//                     tprivategroup pg
//                 join
//                     ttag t on t.tag = pg.name
//                 join
//                     tposttag pt on pt.tag_id = t.tag_id
//                 where
//                     pt.post_id = p.post_id) <@ Array[${dynamicPlaceholders.join()}]::integer[])
//         order by
//             case when $${pAfter} = '' then p.created_on end desc,

//             case when $${pAfter+1} = 'oldest' then p.created_on end asc,

//             case when $${pAfter+2} = 'comments' then p.num_comments end desc,
//             case when $${pAfter+3} = 'comments' then p.created_on end desc,

//             case when $${pAfter+4} = 'last' then p.last_comment end desc nulls last,
//             case when $${pAfter+5} = 'last' then p.created_on end desc
//         limit
//             $${pAfter+6}
//         offset
//             $${pAfter+7}`,
//         finalParams
//     )
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

// exports.updatePost = (postId, title, textContent, link, domainNameId) => {
//     let finalLink = typeof link !== 'undefined' ? link : null
//     let finalTextContent = textContent.trim() === '' ? null : textContent

//     return query(`
//         update
//             tpost
//         set
//             title = $1,
//             link = $2,
//             text_content = $3,
//             domain_name_id = $4
//         where
//             post_id = $5`,
//         [title, finalLink, finalTextContent, domainNameId, postId])
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





// exports.createCommentComment = (postId, userId, content, parentPath, timeZone) => {
//     let lQuery = parentPath + '.*{1}'

//     return query(`
//         select
//             count(1) as count
//         from
//             ttest
//         where
//             path ~ $1`,
//         [lQuery]).then(res => query(`
//         insert into ttest
//             (post_id, user_id, text_content, path, public_id)
//         values
//             ($1, $2, $3, $4, $5)
//         returning
//             public_id,
//             text_content,
//             to_char(
//                 timezone($6, created_on),
//                 'Mon FMDD, YYYY FMHH12:MIam') created_on`,
//         [postId, userId, content,
//             parentPath + '.' + numToOrderedAlpha(parseInt(res.rows[0].count) + 1),
//             generateNanoId(nanoidAlphabet, nanoidLen),
//             timeZone])
//     )
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


// exports.getCommentComments = (path, timeZone, userId, isDiscoverMode, filterUserId, page) => {
//     const limit = config.commentsPerPage
//     const offset = (page - 1)*config.commentsPerPage

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
//             c.created_on created_on_raw,
//             c.public_id,
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
//         where
//             c.path <@ $6 and
//             not (c.path ~ $7) and
//             ($8 or not exists(
//                 select
//                     1
//                 from
//                     ttest c2
//                 where
//                     c2.path @> c.path and
//                     not exists(select 1 from tfollower where user_id = $9 and followee_user_id = c2.user_id) and
//                     c2.user_id != $10 and
//                     c2.user_id != $11 and
//                     not (c2.path @> $12)))
//         order by
//             c.path
//         limit
//             $13
//         offset
//             $14`,
//         [timeZone, userId, filterUserId, filterUserId, userId,
//             path, path, isDiscoverMode, filterUserId, userId,
//             filterUserId, path, limit, offset])
// }



// //tags
// exports.createTag = (tagName) => {
//     return query(`
//         insert into ttag
//             (tag)
//         values
//             (lower($1))
//         returning
//             tag_id`,
//         [tagName])
// }

// exports.createPostTag = (tagId, postId) => {
//     return query(`
//         insert into tposttag
//             (tag_id, post_id)
//         values
//             ($1, $2)`,
//         [tagId, postId])
// }



// exports.createPrivateGroup = (groupName, userId) => {
//     return query(`
//         insert into tprivategroup
//             (created_by, name)
//         values
//             ($1, $2)`,
//         [userId, groupName])
// }

// exports.getPrivateGroupWithName = (groupName) => {
//     return query(`
//         select
//             private_group_id,
//             created_by
//         from
//             tprivategroup
//         where
//             name = lower($1)`,
//         [groupName]
//     )
// }

// exports.getPrivateGroupsWithNames = (groupNames) => {
//     const placeholders = []

//     for(let i = 1; i <= groupNames.length; ++i) {
//         placeholders.push(`$${i}`)
//     }

//     return query(`
//         select
//             private_group_id,
//             created_by,
//             name
//         from
//             tprivategroup
//         where
//             name in(${placeholders.join()})`,
//         groupNames
//     )
// }

// exports.getUserCreatedPrivateGroups = (userId) => {
//     return query(`
//         select
//             name
//         from
//             tprivategroup
//         where
//             created_by = $1
//         order by
//             name`,
//         [userId]
//     )
// }

// exports.getUserMemberPrivateGroups = (userId) => {
//     return query(`
//         select
//             pg.name
//         from
//             tprivategroup pg
//         join
//             tgroupmember gm on gm.private_group_id = pg.private_group_id
//         where
//             gm.user_id = $1
//         order by
//             pg.name`,
//         [userId]
//     )
// }





// exports.getTag = (tagName) => {
//     return query(`
//         select
//             tag_id,
//             num_posts
//         from
//             ttag
//         where
//             tag = lower($1)`,
//         [tagName]
//     )
// }

// exports.validatePrivateGroup = async (groupName) => {

//     // this function is used to process and validate multiple groups
//     // when creating and editing posts, but we can use it for a single
//     // group here as well
//     const [cleanedGroups, groupErrors] = myMisc.processPostTags(groupName)

//     //
//     if(groupErrors.length) {
//         return groupErrors
//     }

//     //
//     if(!cleanedGroups.length) {
//         return [{msg:"Please enter a group name"}]
//     }

//     //
//     const errors = []
//     const cleanedGroupName = cleanedGroups[0]

//     //
//     if(cleanedGroupName.substr(0, 2) != 'p-') {
//         errors.push({msg: 'Private group names must start with "p-", e.g. "p-frogs"'})
//     }

//     //
//     if(!errors.length) {
//         const {rows:pgroup} = await module.exports.getPrivateGroupWithName(cleanedGroupName)

//         if(pgroup.length) {
//             errors.push({msg: 'This private group has already been claimed'})
//         }
//     }

//     //
//     if(!errors.length) {
//         const {rows:tagd} = await module.exports.getTag(cleanedGroupName)

//         if(tagd.length && tagd[0].num_posts > 0) {
//             errors.push({msg: 'This group already has public posts'})
//         }
//     }

//     return errors
// }

// exports.deletePostTags = (postId) => {
//     return query(`
//         delete from
//             tposttag
//         where
//             post_id = $1`,
//         [postId])
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

// exports.getGroupMembers = (groupId) => {
//     return query(`
//         select
//             u.public_id,
//             u.username
//         from
//             tuser u
//         join
//             tgroupmember gm on gm.user_id = u.user_id
//         where
//             gm.private_group_id = $1
//         order by
//             u.username`,
//         [groupId]
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


