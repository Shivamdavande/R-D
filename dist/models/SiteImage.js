"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteImage = void 0;
const mongoose_1 = require("mongoose");
require("./User");
const siteImageSchema = new mongoose_1.Schema({
    siteId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Site', required: true, index: true },
    imageUrl: { type: String, required: true },
    imageKitFileId: { type: String },
    fileName: { type: String },
    uploadedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedAt: { type: Date, default: Date.now }
}, { timestamps: true });
exports.SiteImage = (0, mongoose_1.model)('SiteImage', siteImageSchema);
