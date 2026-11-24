import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { login, logout, me } from '../controllers/auth.js';
import { requireEmployee } from '../middleware/session.js';

const router = Router();
router.post('/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  skipSuccessfulRequests: true,
  handler: (req, res) => res.status(429).json({ message: 'Too many attempts. Try again in 15 minutes.' }),
}), login);
router.get('/me', requireEmployee, me);
router.post('/logout', logout);
export default router;
