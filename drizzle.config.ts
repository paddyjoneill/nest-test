// drizzle.config.ts
import type { Config } from 'drizzle-kit';
import process from 'process';

export default {
    schema: './db/drizzle/schema.ts',
    out: './db/drizzle',
    driver: 'pg',
    dbCredentials: {
        connectionString: process.env['SUPABASE_DATABASE_URL'],
    },
} satisfies Config;
