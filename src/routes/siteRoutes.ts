import { Router } from 'express';
import {
  createSite,
  getSites,
  getSiteById,
  updateSite,
  closeSite,
  reopenSite,
  addCollaborator,
  removeCollaborator,
  getSiteMembers
} from '../controllers/siteController';
import { getSiteExpenses, addExpense } from '../controllers/expenseController';
import { getSiteSummary, getItemWiseSummary, getMeasurementBook } from '../controllers/summaryController';
import { getSiteActivityLog } from '../controllers/activityController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { requireSiteAccess, requireSiteOwner, requireActiveSite } from '../middleware/siteAuth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(authenticate);

// List & Create Sites
router.get('/', getSites);
router.post('/', requireRole('OWNER'), createSite);

// Single Site Details, Update
router.get('/:id', requireSiteAccess, getSiteById);
router.put('/:id', requireSiteAccess, requireSiteOwner, updateSite);

// Collaborators
router.get('/:id/members', requireSiteAccess, getSiteMembers);
router.post('/:id/members', requireSiteAccess, requireSiteOwner, addCollaborator);
router.delete('/:id/members/:userId', requireSiteAccess, requireSiteOwner, removeCollaborator);

// Close & Reopen Site
router.post('/:id/close', requireSiteAccess, requireSiteOwner, closeSite);
router.post('/:id/reopen', requireSiteAccess, requireSiteOwner, reopenSite);

// Site Expenses Sub-resource
router.get('/:id/expenses', requireSiteAccess, getSiteExpenses);
router.post('/:id/expenses', requireSiteAccess, requireActiveSite, upload.single('billImage'), addExpense);

// Site Summaries & Aggregations
router.get('/:id/summary', requireSiteAccess, getSiteSummary);
router.get('/:id/item-summary', requireSiteAccess, getItemWiseSummary);
router.get('/:id/measurement-book', requireSiteAccess, getMeasurementBook);
router.get('/:id/activity', requireSiteAccess, getSiteActivityLog);

export default router;
