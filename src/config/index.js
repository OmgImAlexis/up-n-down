import { config } from 'dotenv';

// Load .env into process.env
config();

export const eyesDefaultUsername = "stink";

export const commentsPerPage = 200;

export const database = {
    host: process.env.PGHOST ?? 'localhost',
    user: process.env.PGUSER ?? 'postgres',
    database: process.env.PGDATABASE ?? 'postgres',
    password: process.env.PGPASSWORD ?? '',
    port: process.env.PGPORT ?? 5432
};
