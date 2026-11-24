import { promisify } from 'node:util';
import bcrypt from 'bcryptjs';
import { findCredentials, findProfile } from '../models/user.js';
import { cookieName, cookieOptions } from '../middleware/session.js';
import { HttpError } from '../middleware/errors.js';

const dummyHash = await bcrypt.hash('placeholder-for-missing-employees', 12);

export async function login(req, res) {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = req.body?.password;
  if (!email || typeof password !== 'string' || !password) {
    throw new HttpError(400, 'Enter your email and password.');
  }
  const employee = await findCredentials(email);
  const matches = await bcrypt.compare(password, employee?.passwordHash ?? dummyHash);
  if (!employee || !matches || bcrypt.truncates(password)) {
    throw new HttpError(401, 'Incorrect email or password.');
  }

  await promisify(req.session.regenerate.bind(req.session))();
  req.session.employeeId = employee.id;
  await promisify(req.session.save.bind(req.session))();
  res.json({ id: employee.id, name: employee.name, email: employee.email });
}

export async function me(req, res) {
  const employee = await findProfile(req.session.employeeId);
  if (!employee) throw new HttpError(401, 'Please sign in.');
  res.json(employee);
}

export async function logout(req, res) {
  await promisify(req.session.destroy.bind(req.session))();
  res.clearCookie(cookieName, cookieOptions).sendStatus(204);
}
