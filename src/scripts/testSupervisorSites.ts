import mongoose from 'mongoose';
import { User } from '../models/User';
import { Site } from '../models/Site';
import { SiteMember } from '../models/SiteMember';
import { config } from '../config/env';

async function testSupervisorSites() {
  try {
    await mongoose.connect(config.mongoUri);

    console.log('\n=== TESTING SITES FETCHED FOR EACH USER ===\n');

    const allUsers = await User.find();

    for (const user of allUsers) {
      console.log(`\n-------------------------------------------------`);
      console.log(`User: ${user.name} | Email: ${user.email} | Role: ${user.role}`);

      let sites;
      if (user.role === 'OWNER') {
        sites = await Site.find().sort({ createdAt: -1 });
      } else {
        const memberships = await SiteMember.find({ userId: user._id });
        const siteIds = memberships.map(m => m.siteId);
        sites = await Site.find({ _id: { $in: siteIds } }).sort({ createdAt: -1 });
      }

      console.log(`Visible Sites Count: ${sites.length}`);
      sites.forEach((s, idx) => {
        console.log(`  ${idx + 1}. [${s.status}] ${s.siteName} (ID: ${s._id})`);
      });
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

testSupervisorSites();
