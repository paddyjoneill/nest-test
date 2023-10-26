import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PgDatabase } from 'drizzle-orm/pg-core';
import { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';
import { getDrizzle } from '../../db/drizzle';
import { accounts } from '../../db/drizzle/schema';

@Injectable()
export class UsersService {
    private readonly db: PgDatabase<PostgresJsQueryResultHKT, Record<string, never>>;
    constructor(configService: ConfigService) {
        const connectionString = configService.get<string>('SUPABASE_DATABASE_URL');
        this.db = getDrizzle(connectionString);
    }

    async listUsers() {
        return this.db.select().from(accounts);
    }
}
