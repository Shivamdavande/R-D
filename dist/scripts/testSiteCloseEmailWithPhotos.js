"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../models/User");
const Site_1 = require("../models/Site");
const SiteImage_1 = require("../models/SiteImage");
const emailService_1 = require("../services/emailService");
const pdfService_1 = require("../services/pdfService");
const imagePdfService_1 = require("../services/imagePdfService");
const env_1 = require("../config/env");
async function testCloseSiteEmail() {
    try {
        await mongoose_1.default.connect(env_1.config.mongoUri);
        console.log('MongoDB Connected.');
        const owner = await User_1.User.findOne({ role: 'OWNER' });
        if (!owner) {
            console.log('No owner found.');
            process.exit(1);
        }
        console.log(`Found Owner: ${owner.name} (${owner.email})`);
        let site = await Site_1.Site.findOne();
        if (!site) {
            site = await Site_1.Site.create({
                siteName: 'Test Highway Extension Project',
                clientName: 'NHAI Ltd',
                workOrderNumber: 'WO-NHAI-2026-99',
                contractValue: 500000,
                status: 'ACTIVE',
                createdBy: owner._id
            });
        }
        console.log(`Testing with site: ${site.siteName} (${site._id})`);
        // 1. Generate Report PDF
        const pdfBuffer = await (0, pdfService_1.generateSitePDFReport)({
            site,
            totalCost: 120000,
            grossProfit: 380000,
            profitPercentage: 76,
            categoryBreakdown: [{ _id: 'Material', totalAmount: 120000, count: 2 }],
            items: [{ itemName: 'Cement UltraTech', unit: 'Bags', category: 'Material', totalQuantity: 100, totalCost: 40000, averageRate: 400, entryCount: 1 }],
            detailedExpenses: [],
            userSummary: [{ userName: owner.name, userRole: 'OWNER', totalAmount: 120000, count: 2 }],
            companyName: env_1.config.companyName
        });
        // 2. Generate Photos PDF
        const siteImages = await SiteImage_1.SiteImage.find({ siteId: site._id });
        let photosPdfBuffer = null;
        if (siteImages.length > 0) {
            photosPdfBuffer = await (0, imagePdfService_1.generateSiteImagesPDF)({
                site,
                images: siteImages,
                companyName: env_1.config.companyName
            });
        }
        else {
            // Mock a blank/fallback photos PDF
            photosPdfBuffer = await (0, imagePdfService_1.generateSiteImagesPDF)({
                site,
                images: [],
                companyName: env_1.config.companyName
            });
        }
        console.log(`Report PDF generated: ${pdfBuffer.length} bytes`);
        console.log(`Photos PDF generated: ${photosPdfBuffer ? photosPdfBuffer.length : 0} bytes`);
        // 3. Send Email
        console.log(`Sending site closure email with both PDFs to ${owner.email}...`);
        const emailRes = await (0, emailService_1.sendSiteFinalReportEmail)({
            ownerEmail: owner.email,
            ownerName: owner.name,
            supervisorName: 'Auto Test Supervisor',
            siteName: site.siteName,
            earning: site.contractValue || 500000,
            totalCost: 120000,
            profitLoss: 380000,
            pdfBuffer,
            photosPdfBuffer,
            photoCount: siteImages.length,
            siteId: site._id,
            userId: owner._id
        });
        console.log('Email Result:', emailRes);
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
    catch (e) {
        console.error('Test failed:', e);
        process.exit(1);
    }
}
testCloseSiteEmail();
