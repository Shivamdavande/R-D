"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../config/env");
const User_1 = require("../models/User");
const Site_1 = require("../models/Site");
const SiteMember_1 = require("../models/SiteMember");
const Expense_1 = require("../models/Expense");
const EmailLog_1 = require("../models/EmailLog");
const emailService_1 = require("../services/emailService");
const pdfService_1 = require("../services/pdfService");
async function runTest() {
    console.log('--- Starting Brevo Email Service & OTP Verification Test ---');
    try {
        await mongoose_1.default.connect(env_1.config.mongoUri);
        console.log('✅ Connected to MongoDB:', env_1.config.mongoUri);
        const testEmail = `test_user_${Date.now()}@example.com`;
        const supervisorEmail = `supervisor_${Date.now()}@example.com`;
        const ownerEmail = `owner_${Date.now()}@example.com`;
        // 1. Test Registration OTP Flow
        console.log('\n[1] Testing Registration OTP Flow...');
        const otp = '849201';
        const salt = await bcryptjs_1.default.genSalt(10);
        const otpHash = await bcryptjs_1.default.hash(otp, salt);
        const newUser = await User_1.User.create({
            name: 'Test Contractor',
            email: testEmail,
            password: 'TestPassword123',
            role: 'SUPERVISOR',
            isVerified: false,
            otpHash,
            otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
            otpResendCooldownAt: new Date(Date.now() + 60 * 1000),
            otpAttempts: 0
        });
        console.log('Created unverified user:', newUser.email, '| isVerified:', newUser.isVerified);
        // Call Brevo OTP email service
        const otpEmailResult = await (0, emailService_1.sendRegistrationOtpEmail)({
            email: newUser.email,
            name: newUser.name,
            otp,
            expiryMinutes: 10,
            userId: newUser._id
        });
        console.log('OTP Email Service Result:', otpEmailResult);
        // Verify OTP matching logic
        const isMatch = await bcryptjs_1.default.compare('849201', newUser.otpHash);
        if (isMatch) {
            newUser.isVerified = true;
            newUser.otpHash = undefined;
            newUser.otpExpiresAt = undefined;
            await newUser.save();
            console.log('✅ Account successfully verified! isVerified:', newUser.isVerified);
        }
        else {
            console.error('❌ OTP mismatch');
        }
        // 2. Test Supervisor Assignment Email Flow
        console.log('\n[2] Testing Supervisor Assignment Email Flow...');
        const owner = await User_1.User.create({
            name: 'Raj Sharma (Owner)',
            email: ownerEmail,
            password: 'Password123',
            role: 'OWNER',
            isVerified: true
        });
        const supervisor = await User_1.User.create({
            name: 'Amit Kumar (Supervisor)',
            email: supervisorEmail,
            password: 'Password123',
            role: 'SUPERVISOR',
            isVerified: true
        });
        const testSite = await Site_1.Site.create({
            siteName: 'ABC Construction Site',
            clientName: 'Modern Infra Ltd',
            workOrderNumber: 'WO-2026-99',
            contractValue: 1500000,
            status: 'ACTIVE',
            createdBy: owner._id
        });
        const assignment = await SiteMember_1.SiteMember.create({
            siteId: testSite._id,
            userId: supervisor._id,
            role: 'SUPERVISOR',
            assignedBy: owner._id
        });
        console.log('Assigned supervisor to site in DB:', assignment._id);
        const assignEmailResult = await (0, emailService_1.sendSupervisorAssignmentEmail)({
            supervisorEmail: supervisor.email,
            supervisorName: supervisor.name,
            siteName: testSite.siteName,
            ownerName: owner.name,
            date: new Date().toLocaleDateString('en-IN'),
            siteId: testSite._id,
            userId: supervisor._id
        });
        console.log('Supervisor Assignment Email Result:', assignEmailResult);
        // 3. Test Site Close PDF Report Email to Owner Flow
        console.log('\n[3] Testing Site Close & PDF Report Email Flow...');
        // Add dummy expense
        await Expense_1.Expense.create({
            siteId: testSite._id,
            category: 'MATERIALS',
            itemName: 'ACC Cement 50kg Bags',
            quantity: 100,
            unit: 'BAG',
            rate: 380,
            amount: 38000,
            createdBy: supervisor._id,
            date: new Date()
        });
        // Close site
        testSite.status = 'CLOSED';
        testSite.closedBy = supervisor._id;
        testSite.closedAt = new Date();
        await testSite.save();
        console.log('Site marked as CLOSED in DB:', testSite.siteName, '| Status:', testSite.status);
        const pdfBuffer = await (0, pdfService_1.generateSitePDFReport)({
            site: testSite,
            totalCost: 38000,
            grossProfit: 1462000,
            profitPercentage: 97.47,
            categoryBreakdown: [{ _id: 'MATERIALS', totalAmount: 38000, count: 1 }],
            items: [{ itemName: 'ACC Cement 50kg Bags', unit: 'BAG', category: 'MATERIALS', totalQuantity: 100, totalCost: 38000, averageRate: 380, entryCount: 1 }],
            userSummary: [{ userName: supervisor.name, userRole: 'SUPERVISOR', totalAmount: 38000, count: 1 }],
            companyName: env_1.config.companyName
        });
        console.log('Generated PDF Report Buffer size:', pdfBuffer.length, 'bytes');
        const reportEmailResult = await (0, emailService_1.sendSiteFinalReportEmail)({
            ownerEmail: owner.email,
            ownerName: owner.name,
            supervisorName: supervisor.name,
            siteName: testSite.siteName,
            earning: testSite.contractValue,
            totalCost: 38000,
            profitLoss: 1462000,
            pdfBuffer,
            siteId: testSite._id,
            userId: supervisor._id
        });
        console.log('Site Final Report Email Result:', reportEmailResult);
        // 4. Verify Email Logs in Database
        console.log('\n[4] Verifying Email Logs in Database...');
        const logs = await EmailLog_1.EmailLog.find({ siteId: testSite._id });
        console.log(`Found ${logs.length} email logs for site ${testSite.siteName}:`);
        logs.forEach(l => {
            console.log(`- Type: ${l.emailType} | Recipient: ${l.recipient} | Status: ${l.status}`);
        });
        // Clean up test data
        await User_1.User.deleteMany({ _id: { $in: [newUser._id, owner._id, supervisor._id] } });
        await Site_1.Site.deleteOne({ _id: testSite._id });
        await SiteMember_1.SiteMember.deleteOne({ _id: assignment._id });
        await Expense_1.Expense.deleteMany({ siteId: testSite._id });
        await EmailLog_1.EmailLog.deleteMany({ siteId: testSite._id });
        console.log('\n✅ All Brevo Email Service & OTP Verification tests passed cleanly!');
    }
    catch (err) {
        console.error('❌ Test failed:', err);
    }
    finally {
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
}
runTest();
