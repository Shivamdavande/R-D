"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMeasurementBook = exports.getItemWiseSummary = exports.getSiteSummary = void 0;
const Site_1 = require("../models/Site");
const Expense_1 = require("../models/Expense");
const mongoose_1 = __importDefault(require("mongoose"));
const getSiteSummary = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || id === 'undefined' || id === 'null' || !mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Valid Site ID is required.' });
        }
        const site = await Site_1.Site.findById(id);
        if (!site) {
            return res.status(404).json({ success: false, message: 'Site not found.' });
        }
        const categoryBreakdown = await Expense_1.Expense.aggregate([
            { $match: { siteId: new mongoose_1.default.Types.ObjectId(id), isDeleted: false } },
            {
                $group: {
                    _id: '$category',
                    totalAmount: { $sum: '$amount' },
                    totalQuantity: { $sum: '$quantity' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { totalAmount: -1 } }
        ]);
        const userEntrySummary = await Expense_1.Expense.aggregate([
            { $match: { siteId: new mongoose_1.default.Types.ObjectId(id), isDeleted: false } },
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
                    userId: '$_id',
                    userName: '$userInfo.name',
                    userEmail: '$userInfo.email',
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
        const remainingBudget = contractValue > 0 ? contractValue - totalCost : 0;
        // Standard category map for frontend charts
        const categoryMap = {
            Material: 0,
            Labour: 0,
            Transport: 0,
            Machinery: 0,
            Fuel: 0,
            Electrical: 0,
            Plumbing: 0,
            Tools: 0,
            Safety: 0,
            'Food/Refreshment': 0,
            Accommodation: 0,
            Miscellaneous: 0
        };
        categoryBreakdown.forEach((cat) => {
            categoryMap[cat._id] = cat.totalAmount;
        });
        return res.status(200).json({
            success: true,
            site: {
                _id: site._id,
                id: site._id,
                siteName: site.siteName,
                clientName: site.clientName,
                workOrderNumber: site.workOrderNumber,
                contractValue,
                status: site.status
            },
            metrics: {
                contractValue,
                totalCost,
                remainingBudget,
                grossProfit,
                profitPercentage,
                categoryMap,
                categoryBreakdown,
                userEntrySummary
            }
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to fetch site summary.' });
    }
};
exports.getSiteSummary = getSiteSummary;
const getItemWiseSummary = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || id === 'undefined' || id === 'null' || !mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Valid Site ID is required.' });
        }
        const { category, search, user, startDate, endDate } = req.query;
        const match = { siteId: new mongoose_1.default.Types.ObjectId(id), isDeleted: false };
        if (category)
            match.category = category;
        if (user)
            match.createdBy = new mongoose_1.default.Types.ObjectId(user);
        if (search) {
            match.$or = [
                { itemName: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }
        if (startDate || endDate) {
            match.date = {};
            if (startDate)
                match.date.$gte = new Date(startDate);
            if (endDate)
                match.date.$lte = new Date(endDate);
        }
        // Group by (itemName + unit) so 10 Sheet and 5 Kg stay separate as required by Section 8!
        const itemSummary = await Expense_1.Expense.aggregate([
            { $match: match },
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
                    lastEntryDate: { $max: '$date' },
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
                    lastEntryDate: 1,
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
        const totalExpenses = itemSummary.reduce((acc, curr) => acc + curr.totalCost, 0);
        return res.status(200).json({
            success: true,
            siteId: id,
            count: itemSummary.length,
            totalExpenses,
            items: itemSummary
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to fetch item summary.' });
    }
};
exports.getItemWiseSummary = getItemWiseSummary;
const getMeasurementBook = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || id === 'undefined' || id === 'null' || !mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Valid Site ID is required.' });
        }
        const site = await Site_1.Site.findById(id);
        if (!site) {
            return res.status(404).json({ success: false, message: 'Site not found.' });
        }
        // Aggregates for Site Measurement / Cost Summary (Internal MB)
        const mbItems = await Expense_1.Expense.aggregate([
            { $match: { siteId: new mongoose_1.default.Types.ObjectId(id), isDeleted: false } },
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
                    _id: { itemName: '$itemName', unit: '$unit', category: '$category' },
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
                    category: '$_id.category',
                    totalQuantity: 1,
                    totalCost: 1,
                    averageRate: {
                        $cond: [
                            { $gt: ['$totalQuantity', 0] },
                            { $round: [{ $divide: ['$totalCost', '$totalQuantity'] }, 2] },
                            0
                        ]
                    },
                    addedByUsers: {
                        $filter: {
                            input: '$creatorNames',
                            as: 'name',
                            cond: { $ne: ['$$name', null] }
                        }
                    },
                    remarks: { $concat: ['Internal cost aggregation (', { $toString: '$entryCount' }, ' entries)'] }
                }
            },
            { $sort: { category: 1, itemName: 1 } }
        ]);
        return res.status(200).json({
            success: true,
            title: 'SITE MEASUREMENT / COST SUMMARY',
            site: {
                siteName: site.siteName,
                clientName: site.clientName,
                workOrderNumber: site.workOrderNumber,
                contractValue: site.contractValue
            },
            measurementBook: mbItems
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to fetch measurement book.' });
    }
};
exports.getMeasurementBook = getMeasurementBook;
