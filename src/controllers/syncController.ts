import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Expense } from '../models/Expense';
import { Site } from '../models/Site';
import { ActivityLog } from '../models/ActivityLog';

export const syncBatchExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const { siteId, expenses } = req.body;

    if (!siteId || !Array.isArray(expenses) || expenses.length === 0) {
      return res.status(400).json({ success: false, message: 'siteId and array of expenses are required.' });
    }

    const site = await Site.findById(siteId);
    if (!site) {
      return res.status(404).json({ success: false, message: 'Site not found.' });
    }

    if (site.status === 'CLOSED' && req.user!.role !== 'OWNER') {
      return res.status(403).json({ success: false, message: 'Cannot sync expenses to a CLOSED site.' });
    }

    const syncedResults: any[] = [];
    const createdExpenses: any[] = [];

    for (const item of expenses) {
      const {
        clientLocalId,
        date,
        category,
        itemName,
        quantity,
        unit,
        rate,
        vendor,
        paymentMethod,
        notes,
        billImageUrl
      } = item;

      if (!category || !itemName || !quantity || !unit || rate === undefined) {
        continue; // skip invalid entries
      }

      const numQty = Number(quantity);
      const numRate = Number(rate);
      const amount = Number((numQty * numRate).toFixed(2));

      // Check if already synced using clientLocalId deduplication
      if (clientLocalId) {
        const existing = await Expense.findOne({ siteId, clientLocalId });
        if (existing) {
          syncedResults.push({ clientLocalId, serverId: existing._id, status: 'ALREADY_EXISTS' });
          continue;
        }
      }

      const expense = await Expense.create({
        siteId,
        date: date ? new Date(date) : new Date(),
        category: category.trim(),
        itemName: itemName.trim(),
        quantity: numQty,
        unit: unit.trim(),
        rate: numRate,
        amount,
        vendor: vendor ? vendor.trim() : undefined,
        paymentMethod: paymentMethod || 'CASH',
        notes: notes ? notes.trim() : undefined,
        billImageUrl,
        createdBy: req.user!._id,
        clientLocalId,
        syncStatus: 'SYNCED',
        isDeleted: false
      });

      syncedResults.push({ clientLocalId, serverId: expense._id, status: 'CREATED' });
      createdExpenses.push(expense);
    }

    if (createdExpenses.length > 0) {
      await ActivityLog.create({
        siteId: site._id,
        userId: req.user!._id,
        userName: req.user!.name,
        action: 'EXPENSES_SYNCED',
        details: `${req.user!.name} synced ${createdExpenses.length} offline expense entry(ies) to site "${site.siteName}"`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Successfully synced ${createdExpenses.length} expense(s).`,
      syncedCount: createdExpenses.length,
      results: syncedResults
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Offline batch sync failed.' });
  }
};
