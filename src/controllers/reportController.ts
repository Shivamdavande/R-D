import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Site } from '../models/Site';
import { Expense } from '../models/Expense';
import { generateSitePDFReport } from '../services/pdfService';
import { generateExpensesCSV } from '../services/csvService';
import mongoose from 'mongoose';
import { config } from '../config/env';

export const exportSitePDF = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const site = await Site.findById(id).populate('createdBy', 'name email');

    if (!site) {
      return res.status(404).json({ success: false, message: 'Site not found.' });
    }

    const categoryBreakdown = await Expense.aggregate([
      { $match: { siteId: new mongoose.Types.ObjectId(id), isDeleted: false } },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    const itemSummary = await Expense.aggregate([
      { $match: { siteId: new mongoose.Types.ObjectId(id), isDeleted: false } },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'creator'
        }
      },
      {
        $group: {
          _id: { itemName: '$itemName', unit: '$unit' },
          category: { $first: '$category' },
          totalQuantity: { $sum: '$quantity' },
          totalCost: { $sum: '$amount' },
          entryCount: { $sum: 1 },
          creatorNames: { $addToSet: { $arrayElemAt: ['$creator.name', 0] } }
        }
      },
      {
        $project: {
          _id: 0,
          itemName: '$_id.itemName',
          unit: '$_id.unit',
          category: 1,
          totalQuantity: 1,
          totalCost: 1,
          averageRate: {
            $cond: [
              { $gt: ['$totalQuantity', 0] },
              { $round: [{ $divide: ['$totalCost', '$totalQuantity'] }, 2] },
              0
            ]
          },
          entryCount: 1,
          addedByUsers: {
            $filter: {
              input: '$creatorNames',
              as: 'name',
              cond: { $ne: ['$$name', null] }
            }
          }
        }
      },
      { $sort: { totalCost: -1 } }
    ]);

    const detailedExpenses = await Expense.find({ siteId: new mongoose.Types.ObjectId(id), isDeleted: false })
      .sort({ date: -1 })
      .populate('createdBy', 'name email role');

    const userEntrySummary = await Expense.aggregate([
      { $match: { siteId: new mongoose.Types.ObjectId(id), isDeleted: false } },
      {
        $group: {
          _id: '$createdBy',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          userName: '$userInfo.name',
          userRole: '$userInfo.role',
          totalAmount: 1,
          count: 1
        }
      }
    ]);

    const totalCost = categoryBreakdown.reduce((sum, item) => sum + item.totalAmount, 0);
    const contractValue = site.contractValue || 0;
    const grossProfit = contractValue > 0 ? contractValue - totalCost : 0;
    const profitPercentage = contractValue > 0 ? Number(((grossProfit / contractValue) * 100).toFixed(2)) : 0;

    const pdfBuffer = await generateSitePDFReport({
      site,
      totalCost,
      grossProfit,
      profitPercentage,
      categoryBreakdown,
      items: itemSummary,
      detailedExpenses,
      userSummary: userEntrySummary,
      companyName: config.companyName
    });

    const filename = `RD_Report_${site.siteName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(pdfBuffer);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to generate PDF report.' });
  }
};

export const exportSiteCSV = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const site = await Site.findById(id);

    if (!site) {
      return res.status(404).json({ success: false, message: 'Site not found.' });
    }

    const expenses = await Expense.find({ siteId: id, isDeleted: false })
      .sort({ date: -1 })
      .populate('createdBy', 'name email');

    const csvContent = generateExpensesCSV(expenses);
    const filename = `Expenses_${site.siteName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csvContent);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to export CSV.' });
  }
};
