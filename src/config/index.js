import { config } from 'dotenv';

// Load .env into process.env
config();

export const site = {
    name: `Peaches 'n' Stink`,
    contact: {
        email: 'peachesnstink@protonmail.com'
    }
};

export const eyesDefaultUsername = 'stink';

export const commentsPerPage = 200;

// Database
export const database = {
    host: process.env.PGHOST ?? 'localhost',
    user: process.env.PGUSER ?? 'postgres',
    database: process.env.PGDATABASE ?? 'postgres',
    password: process.env.PGPASSWORD ?? '',
    port: process.env.PGPORT ?? 5432
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
