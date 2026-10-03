"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../config/env");
const User_1 = require("../models/User");
async function checkUsers() {
    try {
        await mongoose_1.default.connect(env_1.config.mongoUri);
        console.log('Connected to DB');
        const users = await User_1.User.find();
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log({
                id: u._id,
                name: u.name,
                email: u.email,
                role: u.role,
                isActive: u.isActive,
                isVerified: u.isVerified,
                hasOtpHash: !!u.otpHash,
                otpExpiresAt: u.otpExpiresAt
            });
        });
    }
    catch (err) {
        console.error('Error:', err);
    }
    finally {
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
}
checkUsers();
