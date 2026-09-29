import { Router } from 'express';
import { getExpenseById, updateExpense, deleteExpense } from '../controllers/expenseController';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(authenticate);

router.get('/:id', getExpenseById);
router.put('/:id', upload.single('billImage'), updateExpense);
router.delete('/:id', deleteExpense);

export default router;
