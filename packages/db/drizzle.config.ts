import { defineConfig } from "drizzle-kit";

import { env } from "@memora/env/db";

export default defineConfig({
  schema: "./src/schema",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
