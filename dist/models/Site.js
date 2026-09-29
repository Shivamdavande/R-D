"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Site = void 0;
const mongoose_1 = require("mongoose");
const siteSchema = new mongoose_1.Schema({
    siteName: { type: String, required: true, trim: true, index: true },
    clientName: { type: String, required: true, trim: true },
    workOrderNumber: { type: String, required: true, trim: true, index: true },
    workOrderDate: { type: Date },
    contractValue: { type: Number, default: 0, min: 0 },
    location: { type: String, trim: true },
    startDate: { type: Date, default: Date.now },
    expectedEndDate: { type: Date },
    actualEndDate: { type: Date },
    description: { type: String, trim: true },
    status: {
        type: String,
        enum: ['ACTIVE', 'COMPLETED', 'CLOSED'],
        default: 'ACTIVE',
        index: true
    },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    closedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    closedAt: { type: Date }
}, { timestamps: true });
exports.Site = (0, mongoose_1.model)('Site', siteSchema);
