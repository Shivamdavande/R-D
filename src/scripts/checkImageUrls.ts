import mongoose from 'mongoose';
import { SiteImage } from '../models/SiteImage';
import { Expense } from '../models/Expense';
import { config } from '../config/env';

async function checkImageUrls() {
  try {
    await mongoose.connect(config.mongoUri);

    console.log('--- ALL SITE IMAGES IN DB ---');
    const images = await SiteImage.find();
    images.forEach((img, i) => {
      console.log(`[${i + 1}] Site: ${img.siteId} | File: ${img.fileName} | URL: ${img.imageUrl}`);
    });

    console.log('\n--- ALL EXPENSES WITH BILL IMAGES IN DB ---');
    const expenses = await Expense.find({ billImageUrl: { $ne: null } });
    expenses.forEach((exp, i) => {
      console.log(`[${i + 1}] Item: ${exp.itemName} | Bill URL: ${exp.billImageUrl}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkImageUrls();
