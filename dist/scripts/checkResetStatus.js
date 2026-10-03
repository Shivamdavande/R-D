"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../config/env");
const User_1 = require("../models/User");
const EmailLog_1 = require("../models/EmailLog");
async function checkResetStatus() {
    await mongoose_1.default.connect(env_1.config.mongoUri);
    const users = await User_1.User.find({ email: 'shivamdavande348@gmail.com' });
    console.log('=== USER DB STATUS ===');
    console.log('Users found:', users.length);
    users.forEach(u => {
        console.log({
            id: u._id,
            name: u.name,
            email: u.email,
            isVerified: u.isVerified,
            hasResetOtpHash: !!u.resetPasswordOtpHash,
            resetOtpExpires: u.resetPasswordOtpExpires,
            resetAttempts: u.resetPasswordOtpAttempts
        });
    });
    const logs = await EmailLog_1.EmailLog.find({ recipient: 'shivamdavande348@gmail.com' }).sort({ createdAt: -1 }).limit(5);
    console.log('\n=== RECENT EMAIL LOGS ===');
    logs.forEach(l => {
        console.log({
            type: l.emailType,
            status: l.status,
            createdAt: l.createdAt
        });
    });
    await mongoose_1.default.disconnect();
    process.exit(0);
}
checkResetStatus();
