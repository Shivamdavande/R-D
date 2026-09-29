"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLog = void 0;
const mongoose_1 = require("mongoose");
const activityLogSchema = new mongoose_1.Schema({
    siteId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Site', required: true, index: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    userName: { type: String, required: true },
    action: {
        type: String,
        required: true,
        index: true
    },
    details: { type: String, required: true },
    expenseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Expense' },
    previousValues: { type: mongoose_1.Schema.Types.Mixed },
    newValues: { type: mongoose_1.Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now, index: true }
}, { timestamps: true });
exports.ActivityLog = (0, mongoose_1.model)('ActivityLog', activityLogSchema);
