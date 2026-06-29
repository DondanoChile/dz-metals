import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres.pcfatvkupcrryqinvsox:Iquique007!@aws-0-us-east-1.pooler.supabase.com:6543/postgres";

const client = postgres(DATABASE_URL);
export const db = drizzle(client, { schema });
