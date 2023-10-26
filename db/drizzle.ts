import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const getDrizzle = (connectionString: string) => {
    const client = postgres(connectionString);
    return drizzle(client);
};

export { getDrizzle };
