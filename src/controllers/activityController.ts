import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ActivityLog } from '../models/ActivityLog';

export const getSiteActivityLog = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const logs = await ActivityLog.find({ siteId: id })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('userId', 'name email role');

    const totalCount = await ActivityLog.countDocuments({ siteId: id });

    return res.status(200).json({
      success: true,
      count: logs.length,
      totalCount,
      logs
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch activity log.' });
  }
};
