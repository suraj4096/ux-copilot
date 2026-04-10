import {
    pgTable,
    text,
} from "drizzle-orm/pg-core";

export const user = pgTable(
    "user",
    {
        email: text("email").primaryKey(),
    },
);