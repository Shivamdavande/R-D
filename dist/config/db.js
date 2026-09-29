"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(env_1.config.mongoUri);
        console.log(`[MongoDB] Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
    }
    catch (error) {
        console.error('[MongoDB] Connection error:', error);
        // Don't terminate process if in mock/test fallback mode
    }
};
exports.connectDB = connectDB;
