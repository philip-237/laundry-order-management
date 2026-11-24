import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('Set DATABASE_URL in backend/.env before starting the backend.');
}

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
});
pool.on('error', () => console.error('An idle PostgreSQL connection was interrupted.'));
export const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
