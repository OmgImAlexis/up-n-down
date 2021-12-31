import { query } from '../db.js';
import { sql } from './sql-tag.js';

export const getDomainName = (domainName: string) => query<{ domain_name_id: string; }>(sql('get-domain-name')`
    SELECT
        domain_name_id
    FROM
        domainname
    WHERE
        domain_name = ${domainName}
`).then(({ rows: [row] }) => row?.domain_name_id);

const createDomainName = (domainName: string) => query<{ domain_name_id: string; }>(sql('create-domain-name')`
    insert into domainname
        (domain_name)
    VALUES
        (${domainName})
    RETURNING
        domain_name_id
`).then(({ rows: [row] }) => row?.domain_name_id);

export const getDomainNameId = async (domainName: string) => {
	// If the domain already exists return it's ID
	const domainNameId = await getDomainName(domainName);
	if (domainNameId) {
		return domainNameId;
	}

	// Create the domain and return it's ID
	return createDomainName(domainName);
};
