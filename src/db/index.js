import postgres from 'pg';
import { database } from '../config/index.js';

const { Pool, types } = postgres;

// Use raw timestamp instead of converting to a js Date object
types.setTypeParser(1114, str => str);

export const pool = new Pool({
	// Either use the connection string or the details
	...(database.connectionString ? { connectionString: database.connectionString } : {
		host: database.host,
		database: database.database,
		password: database.password,
		user: database.user,
	}),
});

// eslint-disable-next-line arrow-body-style
export const query = (query, params) => {
	// eslint-disable-next-line capitalized-comments
	// console.log(query.text ? { text: query.text, values: query.values } : { text: query });
	return pool.query(query, params);
};

// Exports.getUsersWithoutPublicId = () => {
//     return query(`
//         select
//             user_id
//         from
//             "user"
//         where
//             public_id = ''`)
// }

// //
// exports.genUserPublicId = (userId) => {
//     return query(`
//         update
//             "user"
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
//             post
//         where
//             link is not null`)
// }

// exports.updatePostDomainNameId = (postId, domainNameId) => {
//     return query(`
//         update
//             post
//         set
//             domain_name_id = $1
//         where
//             post_id = $2`,
//         [domainNameId, postId])
// }

// exports.setLastCommentTimes = () => {
//     return query(`
//         update
//             post p
//         set
//             last_comment = (
//                 select
//                     max(created_on)
//                 from
//                     comment
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
//             domainname
//         where
//             domain_name = $1`,
//         [domainName])
// }
