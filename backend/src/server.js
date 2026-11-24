import express from 'express';
import { pool } from './models/database.js';
import { HttpError, handleError } from './middleware/errors.js';
import { createSessionMiddleware } from './middleware/session.js';
import auth from './routes/auth.js';
import orders from './routes/orders.js';

const app = express();
app.disable('x-powered-by');
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)
    && ['cross-site', 'same-site'].includes(req.get('Sec-Fetch-Site'))) {
    return next(new HttpError(403, 'Open the app directly to perform this action.'));
  }
  next();
});
app.use('/api', express.json({ limit: '16kb' }), createSessionMiddleware());
app.use('/api/auth', auth);
app.use('/api/orders', orders);
app.use('/api', (req, res, next) => next(new HttpError(404, 'API endpoint not found.')));
app.use(handleError);

const port = process.env.PORT || 3000;
try {
  await pool.query('SELECT 1 FROM "session" LIMIT 1');
  app.listen(Number(port), '0.0.0.0', () => console.log(`Laundry API listening on port ${port}`));
} catch {
  console.error('Could not start the API. Check DATABASE_URL and run the database migration.');
  await pool.end();
  process.exitCode = 1;
}
