import postgres from 'pg';

const { Pool, types } = postgres;

// Use raw timestamp instead of converting to a js Date object
types.setTypeParser(1114, str => str);

const pool = new Pool();

export const query = (query, params) =>
// Console.log(query);
	pool.query(query, params);

// Exports.getUsersWithoutPublicId = () => {
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
