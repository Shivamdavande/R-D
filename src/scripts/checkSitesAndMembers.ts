import mongoose from 'mongoose';
import { User } from '../models/User';
import { Site } from '../models/Site';
import { SiteMember } from '../models/SiteMember';
import { config } from '../config/env';

async function checkSites() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to DB');

    const sites = await Site.find();
    console.log(`\nFound ${sites.length} Sites:`);
    sites.forEach(s => {
      console.log(`- Site ID: ${s._id} | Name: ${s.siteName} | Client: ${s.clientName} | Status: ${s.status} | CreatedBy: ${s.createdBy}`);
    });

    const members = await SiteMember.find();
    console.log(`\nFound ${members.length} SiteMembers:`);
    members.forEach(m => {
      console.log(`- Member ID: ${m._id} | SiteId: ${m.siteId} | UserId: ${m.userId} | Role: ${m.role}`);
    });

    const users = await User.find();
    console.log(`\nFound ${users.length} Users:`);
    users.forEach(u => {
      console.log(`- User ID: ${u._id} | Name: ${u.name} | Role: ${u.role}`);
    });

  } catch (err) {
    console.error('Error checking sites:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkSites();
