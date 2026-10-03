import mongoose from 'mongoose';
import { User } from '../models/User';
import { Site } from '../models/Site';
import { SiteMember } from '../models/SiteMember';
import { config } from '../config/env';

async function checkUsersAndSites() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB Connected.\n');

    const users = await User.find({}, 'name email role isVerified');
    console.log('--- ALL USERS IN DB ---');
    console.table(users.map(u => ({ id: u._id.toString(), name: u.name, email: u.email, role: u.role, isVerified: u.isVerified })));

    const sites = await Site.find({}, 'siteName clientName status createdBy');
    console.log('\n--- ALL SITES IN DB ---');
    console.table(sites.map(s => ({ id: s._id.toString(), siteName: s.siteName, clientName: s.clientName, status: s.status, createdBy: s.createdBy?.toString() })));

    const members = await SiteMember.find().populate('siteId', 'siteName').populate('userId', 'name email role');
    console.log('\n--- ALL SITE MEMBERS IN DB ---');
    console.table(members.map(m => ({
      site: (m.siteId as any)?.siteName || m.siteId,
      user: (m.userId as any)?.name || m.userId,
      userEmail: (m.userId as any)?.email,
      role: m.role
    })));

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

checkUsersAndSites();
