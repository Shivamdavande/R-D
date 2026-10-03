import mongoose from 'mongoose';
import { User } from '../models/User';
import { Site } from '../models/Site';
import { SiteMember } from '../models/SiteMember';
import { config } from '../config/env';

async function setupSupervisor() {
  try {
    await mongoose.connect(config.mongoUri);

    // Check user shivamdavande348@gmail.com
    const user = await User.findOne({ email: 'shivamdavande348@gmail.com' });
    if (user) {
      user.role = 'SUPERVISOR';
      await user.save();
      console.log(`Updated ${user.email} role to: SUPERVISOR`);

      // Add to one site so they see exactly that site
      const site = await Site.findOne({ siteName: 'MPSO BUILDING' });
      const owner = await User.findOne({ role: 'OWNER' });
      if (site && owner) {
        const existing = await SiteMember.findOne({ siteId: site._id, userId: user._id });
        if (!existing) {
          await SiteMember.create({
            siteId: site._id,
            userId: user._id,
            role: 'SUPERVISOR',
            assignedBy: owner._id
          });
          console.log(`Assigned ${user.email} to site: ${site.siteName}`);
        }
      }
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

setupSupervisor();
