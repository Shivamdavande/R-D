import { Router } from 'express';
import { getCategories, addCategory, getUnits, addUnit } from '../controllers/settingsController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/categories', getCategories);
router.post('/categories', addCategory);

router.get('/units', getUnits);
router.post('/units', addUnit);

export default router;
