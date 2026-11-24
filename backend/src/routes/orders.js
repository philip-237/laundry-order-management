import { Router } from 'express';
import { create, get, list, remove, update } from '../controllers/orders.js';
import { requireEmployee } from '../middleware/session.js';

const router = Router();
router.use(requireEmployee);
router.route('/').get(list).post(create);
router.route('/:id').get(get).patch(update).delete(remove);
export default router;
