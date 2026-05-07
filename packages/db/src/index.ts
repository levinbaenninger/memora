import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

import { env } from "@memora/env/server";

const pool = new Pool({ connectionString: env.DATABASE_URL });
export const db = drizzle({ client: pool });
