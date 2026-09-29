"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initProductionDatabase = initProductionDatabase;
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
async function initProductionDatabase() {
    try {
        await mongoose_1.default.connect(env_1.config.mongoUri);
        console.log('[Clean Init] Connected to MongoDB:', env_1.config.mongoUri);
        // Clear all test/dummy collections
        await User_1.User.deleteMany({});
        await Site_1.Site.deleteMany({});
        await SiteMember_1.SiteMember.deleteMany({});
        await Expense_1.Expense.deleteMany({});
        await Category_1.Category.deleteMany({});
        await Unit_1.Unit.deleteMany({});
        await ActivityLog_1.ActivityLog.deleteMany({});
        console.log('[Clean Init] Removed dummy sites, expenses, and test users.');
        // Seed clean default categories
        for (const cat of settingsController_1.DEFAULT_CATEGORIES) {
            await Category_1.Category.create({ name: cat, isCustom: false });
        }
        // Seed clean default units
        for (const unit of settingsController_1.DEFAULT_UNITS) {
            await Unit_1.Unit.create({ name: unit, isCustom: false });
        }
        console.log('====================================================');
        console.log('  🎉 DATABASE RESET SUCCESSFUL FOR REAL PRODUCTION!');
        console.log('  Categories and Measurement Units initialized.');
        console.log('  Database is 100% clean and ready for real sites.');
        console.log('====================================================');
        await mongoose_1.default.disconnect();
    }
    catch (error) {
        console.error('[Clean Init] Error resetting database:', error);
        await mongoose_1.default.disconnect();
    }
}
if (require.main === module) {
    initProductionDatabase();
}
