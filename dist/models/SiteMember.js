"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteMember = void 0;
const mongoose_1 = require("mongoose");
const siteMemberSchema = new mongoose_1.Schema({
    siteId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Site', required: true, index: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: {
        type: String,
        enum: ['OWNER', 'SUPERVISOR', 'VIEWER'],
        default: 'SUPERVISOR'
    },
    assignedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
// Prevent duplicate membership for same site & user
siteMemberSchema.index({ siteId: 1, userId: 1 }, { unique: true });
exports.SiteMember = (0, mongoose_1.model)('SiteMember', siteMemberSchema);
