import { Router } from 'express';
import { getAllUsers } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/role';

const router = Router();

router.use(authenticate);
router.get('/', requireRole('OWNER'), getAllUsers);

export default router;
