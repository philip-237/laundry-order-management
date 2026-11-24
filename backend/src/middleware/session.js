import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { pool } from '../models/database.js';
import { HttpError } from './errors.js';

export const cookieName = 'laundry.sid';
export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

export function createSessionMiddleware() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32 || secret === 'replace-with-generated-secret') {
    throw new Error('Set SESSION_SECRET to a random value of at least 32 characters.');
  }
  const PgStore = connectPgSimple(session);
  return session({
    name: cookieName,
    secret,
    store: new PgStore({ pool, errorLog: () => console.error('A session store operation failed.') }),
    resave: false,
    saveUninitialized: false,
    cookie: { ...cookieOptions, maxAge: 8 * 60 * 60 * 1000 },
  });
}

export function requireEmployee(req, res, next) {
  if (!req.session.employeeId) return next(new HttpError(401, 'Please sign in.'));
  next();
}
