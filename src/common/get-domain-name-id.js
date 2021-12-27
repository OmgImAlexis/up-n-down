import sql from 'sql-tag';
import { query } from '../db/index.js';

export const getDomainName = domainName => query(sql`
    SELECT
        domain_name_id
    FROM
        domainname
    WHERE
        domain_name = ${domainName}
`).then(({ rows: [row] }) => row?.domain_name_id);

const createDomainName = domainName => query(sql`
    insert into domainname
        (domain_name)
    VALUES
        (${domainName})
    RETURNING
        domain_name_id
`).then(({ rows: [row] }) => row?.domain_name_id);

export const getDomainNameId = async domainName => {
	// If the domain already exists return it's ID
	const domainNameId = await getDomainName(domainName);
	if (domainNameId) {
		return domainNameId;
	}

	// Create the domain and return it's ID
	return createDomainName(domainName);
};
