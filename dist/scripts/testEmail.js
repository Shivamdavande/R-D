"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const emailService_1 = require("../services/emailService");
const mongoose_1 = __importDefault(require("mongoose"));
async function test() {
    console.log('Testing Brevo Email setup...');
    console.log('BREVO_API_KEY:', process.env.BREVO_API_KEY ? `${process.env.BREVO_API_KEY.substring(0, 10)}...` : 'NONE');
    console.log('BREVO_SENDER_EMAIL:', process.env.BREVO_SENDER_EMAIL);
    try {
        const mongoUri = process.env.MONGODB_URI || '';
        if (mongoUri) {
            await mongoose_1.default.connect(mongoUri);
            console.log('Connected to MongoDB');
        }
        const result = await (0, emailService_1.sendRegistrationOtpEmail)({
            email: process.env.BREVO_SENDER_EMAIL || 'dhoteghanshyam9@gmail.com',
            name: 'Test User',
            otp: '123456',
            expiryMinutes: 10
        });
        console.log('Test Result:', result);
    }
    catch (err) {
        console.error('Test Failed Exception:', err);
    }
    finally {
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
}
test();
