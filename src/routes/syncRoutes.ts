import { Router } from 'express';
import { syncBatchExpenses } from '../controllers/syncController';
import { authenticate } from '../middleware/auth';
import { requireSiteAccess } from '../middleware/siteAuth';

const router = Router();

router.use(authenticate);

router.post('/batch', requireSiteAccess, syncBatchExpenses);

export default router;
