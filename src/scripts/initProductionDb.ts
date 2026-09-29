import mongoose from 'mongoose';
import { User } from '../models/User';
import { Site } from '../models/Site';
import { SiteMember } from '../models/SiteMember';
import { Expense } from '../models/Expense';
import { Category } from '../models/Category';
import { Unit } from '../models/Unit';
import { ActivityLog } from '../models/ActivityLog';
import { config } from '../config/env';
import { DEFAULT_CATEGORIES, DEFAULT_UNITS } from '../controllers/settingsController';

export async function initProductionDatabase() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('[Clean Init] Connected to MongoDB:', config.mongoUri);

    // Clear all test/dummy collections
    await User.deleteMany({});
    await Site.deleteMany({});
    await SiteMember.deleteMany({});
    await Expense.deleteMany({});
    await Category.deleteMany({});
    await Unit.deleteMany({});
    await ActivityLog.deleteMany({});

    console.log('[Clean Init] Removed dummy sites, expenses, and test users.');

    // Seed clean default categories
    for (const cat of DEFAULT_CATEGORIES) {
      await Category.create({ name: cat, isCustom: false });
    }

    // Seed clean default units
    for (const unit of DEFAULT_UNITS) {
      await Unit.create({ name: unit, isCustom: false });
    }

    console.log('====================================================');
    console.log('  🎉 DATABASE RESET SUCCESSFUL FOR REAL PRODUCTION!');
    console.log('  Categories and Measurement Units initialized.');
    console.log('  Database is 100% clean and ready for real sites.');
    console.log('====================================================');

    await mongoose.disconnect();
  } catch (error) {
    console.error('[Clean Init] Error resetting database:', error);
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  initProductionDatabase();
}
