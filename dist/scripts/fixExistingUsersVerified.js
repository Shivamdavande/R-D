"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../config/env");
const User_1 = require("../models/User");
async function fixUsers() {
    try {
        await mongoose_1.default.connect(env_1.config.mongoUri);
        console.log('Connected to DB');
        const result = await User_1.User.updateMany({ isVerified: { $ne: true } }, { $set: { isVerified: true }, $unset: { otpHash: "", otpExpiresAt: "", otpResendCooldownAt: "", otpAttempts: "" } });
        console.log(`✅ Updated ${result.modifiedCount} users to isVerified: true`);
        const users = await User_1.User.find();
        console.log('\nCurrent All Users in DB:');
        users.forEach(u => {
            console.log(`- ${u.name} (${u.email}) | Role: ${u.role} | Verified: ${u.isVerified}`);
        });
    }
    catch (err) {
        console.error('Error fixing users:', err);
    }
    finally {
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
}
fixUsers();
