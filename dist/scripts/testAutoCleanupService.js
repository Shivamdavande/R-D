"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const imageCleanupService_1 = require("../services/imageCleanupService");
const env_1 = require("../config/env");
async function testCleanup() {
    try {
        await mongoose_1.default.connect(env_1.config.mongoUri);
        console.log('MongoDB Connected.');
        console.log('Running cleanupExpiredClosedSiteImages test...');
        await (0, imageCleanupService_1.cleanupExpiredClosedSiteImages)();
        console.log('Cleanup completed successfully.');
        await mongoose_1.default.disconnect();
    }
    catch (e) {
        console.error('Test error:', e);
    }
}
testCleanup();
