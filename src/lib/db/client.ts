
import { drizzle } from "drizzle-orm/postgres-js";
import { Pool } from "pg";

const client = new Pool({
    connectionString: process.env.DATABASE_URL as string,
    max: 10,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 10000,
});

export const db = drizzle({ client });