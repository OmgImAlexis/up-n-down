import { repository } from '../package.json';
import { config } from 'dotenv';

// Load .env into process.env
config();

export const site = {
	name: 'Up \'n\' Down',
	description: 'A link aggregation site',
	theme: {
		colours: {
			primary: '#4B0082',
		},
	},
	contact: {
		email: '',
	},
	repo: repository
};

export const eyesDefaultUsername = 'stink';

export const postsPerPage = 20;
export const commentsPerPage = 200;

// Web
export const web = {
	port: process.env.WEB_PORT ?? process.env.PORT ?? 0,
};

// Database
export const database = {
	connectionString: process.env.DATABASE_URL,
	host: process.env.PGHOST ?? 'localhost',
	user: process.env.PGUSER ?? 'postgres',
	database: process.env.PGDATABASE ?? 'postgres',
	password: process.env.PGPASSWORD ?? '',
	port: process.env.PGPORT ?? 5432,
};

// Time
export const ONE_SECOND = 1_000;
export const ONE_MINUTE = ONE_SECOND * 60;
export const ONE_HOUR = ONE_MINUTE * 60;
export const ONE_DAY = ONE_HOUR * 24;
export const ONE_WEEK = ONE_DAY * 7;
export const ONE_YEAR = ONE_DAY * 365;

// Cookies
export const cookieMaxAge = ONE_YEAR * 10;
