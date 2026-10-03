import mongoose from 'mongoose';
import { User } from '../models/User';
import { Site } from '../models/Site';
import { Expense } from '../models/Expense';
import { SiteImage } from '../models/SiteImage';
import { sendSiteFinalReportEmail } from '../services/emailService';
import { generateSitePDFReport } from '../services/pdfService';
import { generateSiteImagesPDF } from '../services/imagePdfService';
import { config } from '../config/env';

async function testCloseSiteEmail() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB Connected.');

    const owner = await User.findOne({ role: 'OWNER' });
    if (!owner) {
      console.log('No owner found.');
      process.exit(1);
    }
    console.log(`Found Owner: ${owner.name} (${owner.email})`);

    let site = await Site.findOne();
    if (!site) {
      site = await Site.create({
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
    const pdfBuffer = await generateSitePDFReport({
      site,
      totalCost: 120000,
      grossProfit: 380000,
      profitPercentage: 76,
      categoryBreakdown: [{ _id: 'Material', totalAmount: 120000, count: 2 }],
      items: [{ itemName: 'Cement UltraTech', unit: 'Bags', category: 'Material', totalQuantity: 100, totalCost: 40000, averageRate: 400, entryCount: 1 }],
      detailedExpenses: [],
      userSummary: [{ userName: owner.name, userRole: 'OWNER', totalAmount: 120000, count: 2 }],
      companyName: config.companyName
    });

    // 2. Generate Photos PDF
    const siteImages = await SiteImage.find({ siteId: site._id });
    let photosPdfBuffer: Buffer | null = null;

    if (siteImages.length > 0) {
      photosPdfBuffer = await generateSiteImagesPDF({
        site,
        images: siteImages as any,
        companyName: config.companyName
      });
    } else {
      // Mock a blank/fallback photos PDF
      photosPdfBuffer = await generateSiteImagesPDF({
        site,
        images: [],
        companyName: config.companyName
      });
    }

    console.log(`Report PDF generated: ${pdfBuffer.length} bytes`);
    console.log(`Photos PDF generated: ${photosPdfBuffer ? photosPdfBuffer.length : 0} bytes`);

    // 3. Send Email
    console.log(`Sending site closure email with both PDFs to ${owner.email}...`);
    const emailRes = await sendSiteFinalReportEmail({
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
    await mongoose.disconnect();
    process.exit(0);
  } catch (e) {
    console.error('Test failed:', e);
    process.exit(1);
  }
}

testCloseSiteEmail();
