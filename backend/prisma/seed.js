import bcrypt from 'bcryptjs';
import { seedUser } from '../src/models/user.js';
import { pool, prisma } from '../src/models/database.js';

const name = process.env.EMPLOYEE_NAME?.trim();
const email = process.env.EMPLOYEE_EMAIL?.trim().toLowerCase();
const password = process.env.EMPLOYEE_PASSWORD;

try {
  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || !password || password.length < 8 || bcrypt.truncates(password)) {
    throw new Error('Set an employee name, valid email, and password of at least 8 characters and at most 72 bytes.');
  }
  await seedUser({ name, email, passwordHash: await bcrypt.hash(password, 12) });
  console.log('Employee account is ready.');
} catch {
  console.error('Could not seed the employee. Check the database, migration, and employee settings.');
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
  await pool.end();
}
