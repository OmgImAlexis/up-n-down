import { join as joinPath, dirname } from 'path';
import { fileURLToPath } from 'url';
import { migrate } from 'postgres-migrations';
import { database as databaseConfig } from '../src/config/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const main = async () => {
	const dbConfig = {
		...databaseConfig,
		ensureDatabaseExists: true, // If the db doesn't exist one will be created
		defaultDatabase: 'postgres', // Used when checking/creating "database-name"
	};

	await migrate(dbConfig, joinPath(__dirname, '../migrations'));
};

main().catch(error => {
	console.error('Failed running migrations with "%s".', error.message);
});
