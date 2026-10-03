"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../config/env");
const User_1 = require("../models/User");
async function seed() {
    await mongoose_1.default.connect(env_1.config.mongoUri);
    const email = 'shivamdavande348@gmail.com';
    let user = await User_1.User.findOne({ email });
    if (!user) {
        user = await User_1.User.create({
            name: 'Shivam Davande',
            email: email,
            password: 'Password123!',
            role: 'SUPERVISOR',
            isVerified: true,
            isActive: true
        });
        console.log(`✅ Created verified user for ${email} with password: Password123!`);
    }
    else {
        user.isVerified = true;
        user.isActive = true;
        user.password = 'Password123!';
        user.resetPasswordOtpHash = undefined;
        user.resetPasswordOtpExpires = undefined;
        await user.save();
        console.log(`✅ Updated existing user for ${email} to isVerified: true with password: Password123!`);
    }
    await mongoose_1.default.disconnect();
    process.exit(0);
}
seed();
