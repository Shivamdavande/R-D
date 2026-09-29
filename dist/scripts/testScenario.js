"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTestScenario = runTestScenario;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../models/User");
const Site_1 = require("../models/Site");
const SiteMember_1 = require("../models/SiteMember");
const Expense_1 = require("../models/Expense");
const ActivityLog_1 = require("../models/ActivityLog");
const pdfService_1 = require("../services/pdfService");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/r2r_contractor_test_db';
async function runTestScenario() {
    console.log('================================================================');
    console.log('  R2R CONTRACTOR APP - END-TO-END SCENARIO VERIFICATION TEST');
    console.log('================================================================\n');
    try {
        await mongoose_1.default.connect(mongoUri);
        console.log('[1/7] Connected to MongoDB:', mongoUri);
        // Clean up test data
        await User_1.User.deleteMany({ email: { $in: ['ghanshyam.owner@r2r.com', 'raj.supervisor@r2r.com'] } });
        await Site_1.Site.deleteMany({ siteName: 'Site A - BPCL Petrol Pump' });
        // Step 1: Create Owner User Ghanshyam
        const owner = await User_1.User.create({
            name: 'Ghanshyam (Owner)',
            email: 'ghanshyam.owner@r2r.com',
            password: 'Password123!',
            role: 'OWNER',
            companyName: 'R2R – Raw to Refined'
        });
        console.log(`[2/7] Owner Created: ${owner.name} (${owner._id})`);
        // Step 2: Create Supervisor User Raj
        const raj = await User_1.User.create({
            name: 'Supervisor Raj',
            email: 'raj.supervisor@r2r.com',
            password: 'Password123!',
            role: 'SUPERVISOR',
            companyName: 'R2R – Raw to Refined'
        });
        console.log(`[3/7] Supervisor Created: ${raj.name} (${raj._id})`);
        // Step 3: Owner Creates Site A with Contract Value = ₹10,00,000
        const siteA = await Site_1.Site.create({
            siteName: 'Site A - BPCL Petrol Pump',
            clientName: 'Bharat Petroleum Corporation Limited',
            workOrderNumber: 'BPCL/2026/001',
            contractValue: 1000000,
            location: 'Plot 42, Sector 18, Industrial Hub',
            status: 'ACTIVE',
            createdBy: owner._id
        });
        await SiteMember_1.SiteMember.create({
            siteId: siteA._id,
            userId: owner._id,
            role: 'OWNER',
            assignedBy: owner._id
        });
        console.log(`[4/7] Site A Created: "${siteA.siteName}", Contract Value = ₹${siteA.contractValue.toLocaleString()}`);
        // Step 4: Owner adds Collaborator Supervisor Raj
        const memberRaj = await SiteMember_1.SiteMember.create({
            siteId: siteA._id,
            userId: raj._id,
            role: 'SUPERVISOR',
            assignedBy: owner._id
        });
        console.log(`[5/7] Collaborator Added: ${raj.name} assigned to Site A`);
        // Step 5: Add Expenses according to Prompt
        // Entry 1: Owner adds 18mm Ply - 3 Sheet - ₹2,500
        const exp1 = await Expense_1.Expense.create({
            siteId: siteA._id,
            date: new Date(),
            category: 'Material',
            itemName: '18mm Ply',
            quantity: 3,
            unit: 'Sheet',
            rate: 2500,
            createdBy: owner._id,
            syncStatus: 'SYNCED'
        });
        console.log(` -> Entry 1 (Owner): ${exp1.itemName} | ${exp1.quantity} ${exp1.unit} @ ₹${exp1.rate} = ₹${exp1.amount}`);
        // Entry 2: Raj adds 18mm Ply - 2 Sheet - ₹2,500
        const exp2 = await Expense_1.Expense.create({
            siteId: siteA._id,
            date: new Date(),
            category: 'Material',
            itemName: '18mm Ply',
            quantity: 2,
            unit: 'Sheet',
            rate: 2500,
            createdBy: raj._id,
            syncStatus: 'SYNCED'
        });
        console.log(` -> Entry 2 (Raj):   ${exp2.itemName} | ${exp2.quantity} ${exp2.unit} @ ₹${exp2.rate} = ₹${exp2.amount}`);
        // Entry 3: Raj adds Cement - 20 Bag - ₹380
        const exp3 = await Expense_1.Expense.create({
            siteId: siteA._id,
            date: new Date(),
            category: 'Material',
            itemName: 'Cement',
            quantity: 20,
            unit: 'Bag',
            rate: 380,
            createdBy: raj._id,
            syncStatus: 'SYNCED'
        });
        console.log(` -> Entry 3 (Raj):   ${exp3.itemName} | ${exp3.quantity} ${exp3.unit} @ ₹${exp3.rate} = ₹${exp3.amount}`);
        // Step 6: Perform Item-wise Aggregation Verification
        console.log('\n[6/7] VERIFYING SYSTEM AGGREGATIONS & QUANTITY TRACKING...');
        const itemSummary = await Expense_1.Expense.aggregate([
            { $match: { siteId: siteA._id, isDeleted: false } },
            {
                $group: {
                    _id: { itemName: '$itemName', unit: '$unit' },
                    category: { $first: '$category' },
                    totalQuantity: { $sum: '$quantity' },
                    totalCost: { $sum: '$amount' },
                    entryCount: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    itemName: '$_id.itemName',
                    unit: '$_id.unit',
                    category: 1,
                    totalQuantity: 1,
                    totalCost: 1,
                    averageRate: { $round: [{ $divide: ['$totalCost', '$totalQuantity'] }, 2] },
                    entryCount: 1
                }
            },
            { $sort: { totalCost: -1 } }
        ]);
        const totalSiteExpenseResult = await Expense_1.Expense.aggregate([
            { $match: { siteId: siteA._id, isDeleted: false } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalSiteExpense = totalSiteExpenseResult[0].total;
        console.log('----------------------------------------------------------------');
        console.log('ITEM-WISE SUMMARY RESULTS:');
        itemSummary.forEach(item => {
            console.log(` - Item: ${item.itemName.padEnd(10)} | Total Qty: ${item.totalQuantity} ${item.unit.padEnd(5)} | Total Cost: ₹${item.totalCost.toLocaleString()}`);
        });
        console.log(`TOTAL SITE EXPENSE = ₹${totalSiteExpense.toLocaleString()}`);
        console.log('----------------------------------------------------------------');
        // ASSERTIONS
        const plyItem = itemSummary.find(i => i.itemName === '18mm Ply');
        const cementItem = itemSummary.find(i => i.itemName === 'Cement');
        if (!plyItem || plyItem.totalQuantity !== 5 || plyItem.totalCost !== 12500) {
            throw new Error(`FAIL: 18mm Ply expected Qty=5, Cost=12500. Got Qty=${plyItem?.totalQuantity}, Cost=${plyItem?.totalCost}`);
        }
        if (!cementItem || cementItem.totalQuantity !== 20 || cementItem.totalCost !== 7600) {
            throw new Error(`FAIL: Cement expected Qty=20, Cost=7600. Got Qty=${cementItem?.totalQuantity}, Cost=${cementItem?.totalCost}`);
        }
        if (totalSiteExpense !== 20100) {
            throw new Error(`FAIL: Total Site Expense expected 20100. Got ${totalSiteExpense}`);
        }
        console.log('✅ ALL QUANTITY & COST AGGREGATION ASSERTIONS PASSED PERFECTLY!\n');
        // Step 7: Close Site & Generate Final Report
        console.log('[7/7] CLOSING SITE & GENERATING FINAL PDF REPORT...');
        siteA.status = 'CLOSED';
        siteA.closedBy = owner._id;
        siteA.closedAt = new Date();
        await siteA.save();
        await ActivityLog_1.ActivityLog.create({
            siteId: siteA._id,
            userId: owner._id,
            userName: owner.name,
            action: 'SITE_CLOSED',
            details: `Site "${siteA.siteName}" closed by Owner`
        });
        const categoryBreakdown = await Expense_1.Expense.aggregate([
            { $match: { siteId: siteA._id, isDeleted: false } },
            { $group: { _id: '$category', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);
        const userSummary = [
            { userName: 'Ghanshyam (Owner)', userRole: 'OWNER', totalAmount: 7500, count: 1 },
            { userName: 'Supervisor Raj', userRole: 'SUPERVISOR', totalAmount: 12600, count: 2 }
        ];
        const grossProfit = siteA.contractValue - totalSiteExpense;
        const profitPercentage = Number(((grossProfit / siteA.contractValue) * 100).toFixed(2));
        const pdfBuffer = await (0, pdfService_1.generateSitePDFReport)({
            site: siteA,
            totalCost: totalSiteExpense,
            grossProfit,
            profitPercentage,
            categoryBreakdown,
            items: itemSummary,
            userSummary,
            companyName: 'R2R – Raw to Refined'
        });
        const outputReportPath = path_1.default.join(__dirname, '../../Final_Site_A_Report.pdf');
        fs_1.default.writeFileSync(outputReportPath, pdfBuffer);
        console.log(`✅ FINAL PDF REPORT GENERATED SUCCESSFULLY AT:`);
        console.log(`   ${outputReportPath}`);
        console.log('\n================================================================');
        console.log('  🎉 E2E TEST SCENARIO COMPLETED WITH 100% SUCCESS!');
        console.log('================================================================\n');
        await mongoose_1.default.disconnect();
        return true;
    }
    catch (error) {
        console.error('\n❌ E2E TEST SCENARIO FAILED:', error);
        await mongoose_1.default.disconnect();
        return false;
    }
}
if (require.main === module) {
    runTestScenario();
}
