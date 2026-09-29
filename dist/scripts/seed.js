"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = seedDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../models/User");
const Site_1 = require("../models/Site");
const SiteMember_1 = require("../models/SiteMember");
const Expense_1 = require("../models/Expense");
const Category_1 = require("../models/Category");
const Unit_1 = require("../models/Unit");
const ActivityLog_1 = require("../models/ActivityLog");
const env_1 = require("../config/env");
const settingsController_1 = require("../controllers/settingsController");
async function seedDatabase() {
    try {
        await mongoose_1.default.connect(env_1.config.mongoUri);
        console.log('[Seed] Connected to MongoDB:', env_1.config.mongoUri);
        // Clear existing collections
        await User_1.User.deleteMany({});
        await Site_1.Site.deleteMany({});
        await SiteMember_1.SiteMember.deleteMany({});
        await Expense_1.Expense.deleteMany({});
        await Category_1.Category.deleteMany({});
        await Unit_1.Unit.deleteMany({});
        await ActivityLog_1.ActivityLog.deleteMany({});
        console.log('[Seed] Cleared old collections.');
        // Seed Categories & Units
        for (const cat of settingsController_1.DEFAULT_CATEGORIES) {
            await Category_1.Category.create({ name: cat, isCustom: false });
        }
        for (const unit of settingsController_1.DEFAULT_UNITS) {
            await Unit_1.Unit.create({ name: unit, isCustom: false });
        }
        console.log('[Seed] Categories and Units initialized.');
        // Create Owner & Supervisors
        const owner = await User_1.User.create({
            name: 'Ghanshyam (Owner)',
            email: 'owner@r2r.com',
            password: 'OwnerPassword123!',
            phone: '+91 98765 43210',
            role: 'OWNER',
            companyName: 'R2R – Raw to Refined'
        });
        const supervisorRaj = await User_1.User.create({
            name: 'Raj (Site Supervisor)',
            email: 'raj@r2r.com',
            password: 'RajPassword123!',
            phone: '+91 98765 11111',
            role: 'SUPERVISOR',
            companyName: 'R2R – Raw to Refined'
        });
        const supervisorAmit = await User_1.User.create({
            name: 'Amit (Site Supervisor)',
            email: 'amit@r2r.com',
            password: 'AmitPassword123!',
            phone: '+91 98765 22222',
            role: 'SUPERVISOR',
            companyName: 'R2R – Raw to Refined'
        });
        console.log('[Seed] Created users: Owner (owner@r2r.com), Raj (raj@r2r.com), Amit (amit@r2r.com)');
        // Create Site 1: BPCL XYZ Petrol Pump
        const site1 = await Site_1.Site.create({
            siteName: 'BPCL XYZ Petrol Pump',
            clientName: 'Bharat Petroleum Corp Ltd',
            workOrderNumber: 'BPCL/2026/001',
            workOrderDate: new Date('2026-01-15'),
            contractValue: 1250000,
            location: 'NH-44 Bypass, Highway Junction',
            startDate: new Date('2026-02-01'),
            expectedEndDate: new Date('2026-11-30'),
            description: 'Construction of 4-bay petrol pump station including canopy civil work and underground tank pit',
            status: 'ACTIVE',
            createdBy: owner._id
        });
        // Site Members
        await SiteMember_1.SiteMember.create({ siteId: site1._id, userId: owner._id, role: 'OWNER', assignedBy: owner._id });
        await SiteMember_1.SiteMember.create({ siteId: site1._id, userId: supervisorRaj._id, role: 'SUPERVISOR', assignedBy: owner._id });
        await SiteMember_1.SiteMember.create({ siteId: site1._id, userId: supervisorAmit._id, role: 'SUPERVISOR', assignedBy: owner._id });
        // Seed Expenses for Site 1
        const expensesSite1 = [
            {
                siteId: site1._id,
                date: new Date('2026-09-20'),
                category: 'Material',
                itemName: '18mm Ply',
                quantity: 3,
                unit: 'Sheet',
                rate: 2500,
                amount: 7500,
                vendor: 'Apex Plywoods',
                paymentMethod: 'UPI',
                notes: 'Canopy shuttering ply sheets',
                createdBy: owner._id,
                syncStatus: 'SYNCED'
            },
            {
                siteId: site1._id,
                date: new Date('2026-09-21'),
                category: 'Material',
                itemName: '18mm Ply',
                quantity: 2,
                unit: 'Sheet',
                rate: 2500,
                amount: 5000,
                vendor: 'Apex Plywoods',
                paymentMethod: 'CASH',
                notes: 'Additional shuttering for column beam',
                createdBy: supervisorRaj._id,
                syncStatus: 'SYNCED'
            },
            {
                siteId: site1._id,
                date: new Date('2026-09-22'),
                category: 'Material',
                itemName: 'Cement',
                quantity: 120,
                unit: 'Bag',
                rate: 380,
                amount: 45600,
                vendor: 'Ultratech Supplier',
                paymentMethod: 'CHEQUE',
                notes: 'PPC 53 Grade Cement 120 bags delivered',
                createdBy: supervisorRaj._id,
                syncStatus: 'SYNCED'
            },
            {
                siteId: site1._id,
                date: new Date('2026-09-23'),
                category: 'Material',
                itemName: 'Steel (TMT 12mm)',
                quantity: 850,
                unit: 'Kg',
                rate: 65,
                amount: 55250,
                vendor: 'Jindal Steel Depot',
                paymentMethod: 'BANK_TRANSFER',
                notes: 'Foundation reinforcement bars',
                createdBy: supervisorAmit._id,
                syncStatus: 'SYNCED'
            },
            {
                siteId: site1._id,
                date: new Date('2026-09-24'),
                category: 'Labour',
                itemName: 'Mason & Helper Daily Wage',
                quantity: 15,
                unit: 'Day',
                rate: 900,
                amount: 13500,
                vendor: 'Ramesh Labour Contractor',
                paymentMethod: 'CASH',
                notes: '5 Masons + 10 Helpers team wage',
                createdBy: supervisorRaj._id,
                syncStatus: 'SYNCED'
            },
            {
                siteId: site1._id,
                date: new Date('2026-09-25'),
                category: 'Machinery',
                itemName: 'JCB Earthmover Rental',
                quantity: 2,
                unit: 'Day',
                rate: 4500,
                amount: 9000,
                vendor: 'Shree Earthmovers',
                paymentMethod: 'UPI',
                notes: 'Tank pit excavation',
                createdBy: owner._id,
                syncStatus: 'SYNCED'
            }
        ];
        for (const exp of expensesSite1) {
            await Expense_1.Expense.create(exp);
        }
        // Activity Logs
        await ActivityLog_1.ActivityLog.create({
            siteId: site1._id,
            userId: owner._id,
            userName: owner.name,
            action: 'SITE_CREATED',
            details: 'Created site "BPCL XYZ Petrol Pump" with Contract Value ₹12,50,000'
        });
        await ActivityLog_1.ActivityLog.create({
            siteId: site1._id,
            userId: owner._id,
            userName: owner.name,
            action: 'MEMBER_ADDED',
            details: 'Added Supervisor Raj and Supervisor Amit to site'
        });
        console.log('[Seed] Database seeded successfully with initial sites, members, and expenses!');
        await mongoose_1.default.disconnect();
    }
    catch (error) {
        console.error('[Seed] Error seeding database:', error);
        await mongoose_1.default.disconnect();
    }
}
if (require.main === module) {
    seedDatabase();
}
