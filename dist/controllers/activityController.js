"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSiteActivityLog = void 0;
const ActivityLog_1 = require("../models/ActivityLog");
const getSiteActivityLog = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 50, page = 1 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const logs = await ActivityLog_1.ActivityLog.find({ siteId: id })
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate('userId', 'name email role');
        const totalCount = await ActivityLog_1.ActivityLog.countDocuments({ siteId: id });
        return res.status(200).json({
            success: true,
            count: logs.length,
            totalCount,
            logs
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to fetch activity log.' });
    }
};
exports.getSiteActivityLog = getSiteActivityLog;
