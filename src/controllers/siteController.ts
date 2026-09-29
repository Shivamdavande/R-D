import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Site } from '../models/Site';
import { SiteMember } from '../models/SiteMember';
import { Expense } from '../models/Expense';
import { ActivityLog } from '../models/ActivityLog';
import { User } from '../models/User';

export const createSite = async (req: AuthRequest, res: Response) => {
  try {
    const {
      siteName,
      clientName,
      workOrderNumber,
      workOrderDate,
      contractValue,
      location,
      startDate,
      expectedEndDate,
      description
    } = req.body;

    if (!siteName || !clientName || !workOrderNumber) {
      return res.status(400).json({
        success: false,
        message: 'Site Name, Client Name, and Work Order Number are required.'
      });
    }

    const site = await Site.create({
      siteName,
      clientName,
      workOrderNumber,
      workOrderDate: workOrderDate ? new Date(workOrderDate) : undefined,
      contractValue: Number(contractValue) || 0,
      location,
      startDate: startDate ? new Date(startDate) : new Date(),
      expectedEndDate: expectedEndDate ? new Date(expectedEndDate) : undefined,
      description,
      status: 'ACTIVE',
      createdBy: req.user!._id
    });

    // Automatically add owner as SiteMember
    await SiteMember.create({
      siteId: site._id,
      userId: req.user!._id,
      role: 'OWNER',
      assignedBy: req.user!._id
    });

    // Log Activity
    await ActivityLog.create({
      siteId: site._id,
      userId: req.user!._id,
      userName: req.user!.name,
      action: 'SITE_CREATED',
      details: `Created site "${site.siteName}" (WO: ${site.workOrderNumber}, Value: ₹${site.contractValue.toLocaleString()})`
    });

    return res.status(201).json({
      success: true,
      message: 'Site created successfully.',
      site
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to create site.' });
  }
};

export const getSites = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    let sites;

    if (user.role === 'OWNER') {
      // Owner sees all sites
      sites = await Site.find().sort({ createdAt: -1 }).populate('createdBy', 'name email');
    } else {
      // Supervisors & Viewers see assigned sites
      const memberships = await SiteMember.find({ userId: user._id });
      const siteIds = memberships.map(m => m.siteId);
      sites = await Site.find({ _id: { $in: siteIds } }).sort({ createdAt: -1 }).populate('createdBy', 'name email');
    }

    // Attach total expenses & expense counts for dashboard cards
    const sitesWithMetrics = await Promise.all(
      sites.map(async (site) => {
        const totalExpensesResult = await Expense.aggregate([
          { $match: { siteId: site._id, isDeleted: false } },
          { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);

        const totalExpenses = totalExpensesResult.length > 0 ? totalExpensesResult[0].total : 0;
        const expenseCount = totalExpensesResult.length > 0 ? totalExpensesResult[0].count : 0;
        const profit = site.contractValue > 0 ? site.contractValue - totalExpenses : 0;
        const profitPercentage = site.contractValue > 0 ? Number(((profit / site.contractValue) * 100).toFixed(2)) : 0;

        return {
          ...site.toObject(),
          totalExpenses,
          expenseCount,
          profit,
          profitPercentage
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: sitesWithMetrics.length,
      sites: sitesWithMetrics
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch sites.' });
  }
};

export const getSiteById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const site = await Site.findById(id).populate('createdBy', 'name email').populate('closedBy', 'name email');

    if (!site) {
      return res.status(404).json({ success: false, message: 'Site not found.' });
    }

    // Calculate quick metrics
    const totalExpensesResult = await Expense.aggregate([
      { $match: { siteId: site._id, isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    const totalExpenses = totalExpensesResult.length > 0 ? totalExpensesResult[0].total : 0;
    const expenseCount = totalExpensesResult.length > 0 ? totalExpensesResult[0].count : 0;
    const profit = site.contractValue > 0 ? site.contractValue - totalExpenses : 0;
    const profitPercentage = site.contractValue > 0 ? Number(((profit / site.contractValue) * 100).toFixed(2)) : 0;

    const members = await SiteMember.find({ siteId: site._id }).populate('userId', 'name email role phone');

    return res.status(200).json({
      success: true,
      site: {
        ...site.toObject(),
        totalExpenses,
        expenseCount,
        profit,
        profitPercentage,
        members
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch site details.' });
  }
};

export const updateSite = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const site = await Site.findById(id);

    if (!site) {
      return res.status(404).json({ success: false, message: 'Site not found.' });
    }

    const updatedSite = await Site.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    await ActivityLog.create({
      siteId: site._id,
      userId: req.user!._id,
      userName: req.user!.name,
      action: 'SITE_UPDATED',
      details: `Updated details for site "${site.siteName}"`
    });

    return res.status(200).json({
      success: true,
      message: 'Site updated successfully.',
      site: updatedSite
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update site.' });
  }
};

export const closeSite = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const site = await Site.findById(id);

    if (!site) {
      return res.status(404).json({ success: false, message: 'Site not found.' });
    }

    if (site.status === 'CLOSED') {
      return res.status(400).json({ success: false, message: 'Site is already closed.' });
    }

    site.status = 'CLOSED';
    site.closedBy = req.user!._id;
    site.closedAt = new Date();
    await site.save();

    await ActivityLog.create({
      siteId: site._id,
      userId: req.user!._id,
      userName: req.user!.name,
      action: 'SITE_CLOSED',
      details: `Site "${site.siteName}" was closed by Owner ${req.user!.name}`
    });

    return res.status(200).json({
      success: true,
      message: 'Site closed successfully.',
      site
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to close site.' });
  }
};

export const reopenSite = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const site = await Site.findById(id);

    if (!site) {
      return res.status(404).json({ success: false, message: 'Site not found.' });
    }

    site.status = 'ACTIVE';
    site.closedBy = undefined;
    site.closedAt = undefined;
    await site.save();

    await ActivityLog.create({
      siteId: site._id,
      userId: req.user!._id,
      userName: req.user!.name,
      action: 'SITE_REOPENED',
      details: `Site "${site.siteName}" was reopened by Owner ${req.user!.name}`
    });

    return res.status(200).json({
      success: true,
      message: 'Site reopened successfully.',
      site
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to reopen site.' });
  }
};

export const addCollaborator = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required.' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User to add not found.' });
    }

    const existingMember = await SiteMember.findOne({ siteId: id, userId });
    if (existingMember) {
      existingMember.role = role || existingMember.role;
      await existingMember.save();
      return res.status(200).json({ success: true, message: 'Updated collaborator role.', member: existingMember });
    }

    const newMember = await SiteMember.create({
      siteId: id,
      userId,
      role: role || 'SUPERVISOR',
      assignedBy: req.user!._id
    });

    await ActivityLog.create({
      siteId: id as any,
      userId: req.user!._id,
      userName: req.user!.name,
      action: 'MEMBER_ADDED',
      details: `Added ${targetUser.name} (${targetUser.email}) as ${newMember.role} to site`
    });

    return res.status(201).json({
      success: true,
      message: `Collaborator ${targetUser.name} added to site successfully.`,
      member: newMember
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to add collaborator.' });
  }
};

export const removeCollaborator = async (req: AuthRequest, res: Response) => {
  try {
    const { id, userId } = req.params;

    const targetUser = await User.findById(userId);
    await SiteMember.deleteOne({ siteId: id, userId });

    await ActivityLog.create({
      siteId: id as any,
      userId: req.user!._id,
      userName: req.user!.name,
      action: 'MEMBER_REMOVED',
      details: `Removed ${targetUser?.name || 'user'} from site collaborators`
    });

    return res.status(200).json({
      success: true,
      message: 'Collaborator removed successfully.'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to remove collaborator.' });
  }
};

export const getSiteMembers = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const members = await SiteMember.find({ siteId: id }).populate('userId', 'name email role phone');
    return res.status(200).json({ success: true, count: members.length, members });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch site members.' });
  }
};
