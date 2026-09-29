"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unit = void 0;
const mongoose_1 = require("mongoose");
const unitSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    isCustom: { type: Boolean, default: false },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
exports.Unit = (0, mongoose_1.model)('Unit', unitSchema);
