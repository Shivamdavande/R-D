"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const SiteImage_1 = require("../models/SiteImage");
const Expense_1 = require("../models/Expense");
const env_1 = require("../config/env");
async function checkImageUrls() {
    try {
        await mongoose_1.default.connect(env_1.config.mongoUri);
        console.log('--- ALL SITE IMAGES IN DB ---');
        const images = await SiteImage_1.SiteImage.find();
        images.forEach((img, i) => {
            console.log(`[${i + 1}] Site: ${img.siteId} | File: ${img.fileName} | URL: ${img.imageUrl}`);
        });
        console.log('\n--- ALL EXPENSES WITH BILL IMAGES IN DB ---');
        const expenses = await Expense_1.Expense.find({ billImageUrl: { $ne: null } });
        expenses.forEach((exp, i) => {
            console.log(`[${i + 1}] Item: ${exp.itemName} | Bill URL: ${exp.billImageUrl}`);
        });
        await mongoose_1.default.disconnect();
    }
    catch (err) {
        console.error(err);
    }
}
checkImageUrls();
