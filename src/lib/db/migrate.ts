import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

const runMigrate = async () => {
    const db = drizzle({ client: new Pool({ connectionString: process.env.DATABASE_URL as string }) });

    const start = Date.now();
    await migrate(db, { migrationsFolder: "./src/lib/db/migrations" });
    const end = Date.now();

    console.log(`Migrations completed in ${end - start}ms`);
    process.exit(0);
};

runMigrate().catch((err) => {
    console.error("Migration failed");
    console.error(err);
    process.exit(1);
});