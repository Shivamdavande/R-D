"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runImageTestScenario = runImageTestScenario;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../models/User");
const Site_1 = require("../models/Site");
const SiteImage_1 = require("../models/SiteImage");
const imagePdfService_1 = require("../services/imagePdfService");
const imageKitService_1 = require("../services/imageKitService");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/r2r_contractor_test_db';
async function runImageTestScenario() {
    console.log('================================================================');
    console.log('  R2R CONTRACTOR APP - SITE IMAGES & PDF VERIFICATION TEST');
    console.log('================================================================\n');
    try {
        await mongoose_1.default.connect(mongoUri);
        console.log('[1/6] Connected to MongoDB:', mongoUri);
        // Clean up test users & sites
        await User_1.User.deleteMany({ email: 'imgtest.owner@r2r.com' });
        await Site_1.Site.deleteMany({ siteName: 'Indore Commercial Project' });
        // Step 1: Create Owner User
        const owner = await User_1.User.create({
            name: 'Owner Ramesh',
            email: 'imgtest.owner@r2r.com',
            password: 'Password123!',
            role: 'OWNER',
            companyName: 'R2R – Raw to Refined'
        });
        console.log(`[2/6] Owner Created: ${owner.name}`);
        // Step 2: Create Site
        const site = await Site_1.Site.create({
            siteName: 'Indore Commercial Project',
            clientName: 'Indore Realty Pvt Ltd',
            workOrderNumber: 'WO-IND-2026-99',
            contractValue: 2500000,
            location: 'Vijay Nagar, Indore',
            status: 'ACTIVE',
            createdBy: owner._id
        });
        console.log(`[3/6] Site Created: "${site.siteName}"`);
        // Step 3: Test ImageKit Upload Helper
        const sampleBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
        const uploadResult = await (0, imageKitService_1.uploadToImageKit)(sampleBuffer, 'site_foundation_photo.jpg', `/sites/${site._id}`);
        console.log(`[4/6] Image Upload Result: URL=${uploadResult.url}, fileId=${uploadResult.fileId}`);
        // Create Site Image DB record
        const siteImage1 = await SiteImage_1.SiteImage.create({
            siteId: site._id,
            imageUrl: uploadResult.url,
            imageKitFileId: uploadResult.fileId,
            fileName: uploadResult.name,
            uploadedBy: owner._id,
            uploadedAt: new Date()
        });
        const siteImage2 = await SiteImage_1.SiteImage.create({
            siteId: site._id,
            imageUrl: uploadResult.url,
            imageKitFileId: `${uploadResult.fileId}_2`,
            fileName: 'second_site_photo.jpg',
            uploadedBy: owner._id,
            uploadedAt: new Date()
        });
        console.log(` -> Added 2 Site Image records for Site "${site.siteName}"`);
        // Step 4: Verify Site Image retrieval & count
        const fetchedImages = await SiteImage_1.SiteImage.find({ siteId: site._id });
        if (fetchedImages.length !== 2) {
            throw new Error(`Expected 2 images, got ${fetchedImages.length}`);
        }
        console.log(`[5/6] Verified Image count: ${fetchedImages.length} photos found for site.`);
        // Step 5: Test Single PDF Generation containing ALL Site Images
        const pdfBuffer = await (0, imagePdfService_1.generateSiteImagesPDF)({
            site,
            images: fetchedImages,
            companyName: 'R2R – Raw to Refined'
        });
        const pdfPath = path_1.default.join(__dirname, '../../Indore_Site_Images_Report.pdf');
        fs_1.default.writeFileSync(pdfPath, pdfBuffer);
        console.log(`[6/6] ✅ Site Images PDF Report generated successfully at:`);
        console.log(`   ${pdfPath}`);
        // Test Image deletion
        await (0, imageKitService_1.deleteFromImageKit)(siteImage2.imageKitFileId);
        await SiteImage_1.SiteImage.findByIdAndDelete(siteImage2._id);
        const countAfterDelete = await SiteImage_1.SiteImage.countDocuments({ siteId: site._id });
        console.log(` -> Deleted 1 photo. Remaining count: ${countAfterDelete}`);
        console.log('\n================================================================');
        console.log('  🎉 SITE IMAGES & PDF TEST COMPLETED WITH 100% SUCCESS!');
        console.log('================================================================\n');
        await mongoose_1.default.disconnect();
        return true;
    }
    catch (err) {
        console.error('❌ SITE IMAGES TEST FAILED:', err);
        await mongoose_1.default.disconnect();
        return false;
    }
}
if (require.main === module) {
    runImageTestScenario();
}
