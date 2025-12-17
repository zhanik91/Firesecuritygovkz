import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-serverless';
import { Pool as PgPool } from 'pg';
import { drizzle as pgDrizzle } from 'drizzle-orm/node-postgres';
import ws from "ws";
import * as schema from "@shared/schema";

const DRIVER = (process.env.DATABASE_DRIVER || '').toLowerCase(); // 'neon' | 'pg'

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

let db: any;

if (DRIVER === 'pg' || process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1')) {
  const pool = new PgPool({ connectionString: process.env.DATABASE_URL });
  db = pgDrizzle(pool, { schema });
} else {
  neonConfig.webSocketConstructor = ws;
  const pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
  db = neonDrizzle({ client: pool, schema });
}

export { db };