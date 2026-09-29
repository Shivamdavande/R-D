import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Category } from '../models/Category';
import { Unit } from '../models/Unit';

export const DEFAULT_CATEGORIES = [
  'Material',
  'Labour',
  'Transport',
  'Machinery',
  'Fuel',
  'Electrical',
  'Plumbing',
  'Tools',
  'Safety',
  'Food/Refreshment',
  'Accommodation',
  'Miscellaneous'
];

export const DEFAULT_UNITS = [
  'Nos',
  'Sheet',
  'Bag',
  'Kg',
  'Tonne',
  'Litre',
  'Meter',
  'Sq Ft',
  'Sq Meter',
  'Day',
  'Hour',
  'Trip',
  'Set',
  'Piece',
  'Box'
];

export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const customCategories = await Category.find().sort({ name: 1 });
    const customNames = customCategories.map(c => c.name);

    // Merge default categories with custom categories
    const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...customNames]));

    return res.status(200).json({
      success: true,
      categories: allCategories,
      defaults: DEFAULT_CATEGORIES,
      custom: customCategories
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch categories.' });
  }
};

export const addCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const trimmedName = name.trim();
    if (DEFAULT_CATEGORIES.includes(trimmedName)) {
      return res.status(400).json({ success: false, message: 'This is already a default category.' });
    }

    const existing = await Category.findOne({ name: trimmedName });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists.' });
    }

    const category = await Category.create({
      name: trimmedName,
      isCustom: true,
      createdBy: req.user!._id
    });

    return res.status(201).json({ success: true, message: 'Category added.', category });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUnits = async (req: AuthRequest, res: Response) => {
  try {
    const customUnits = await Unit.find().sort({ name: 1 });
    const customNames = customUnits.map(u => u.name);

    const allUnits = Array.from(new Set([...DEFAULT_UNITS, ...customNames]));

    return res.status(200).json({
      success: true,
      units: allUnits,
      defaults: DEFAULT_UNITS,
      custom: customUnits
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch units.' });
  }
};

export const addUnit = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Unit name is required.' });
    }

    const trimmedName = name.trim();
    if (DEFAULT_UNITS.includes(trimmedName)) {
      return res.status(400).json({ success: false, message: 'This is already a default unit.' });
    }

    const existing = await Unit.findOne({ name: trimmedName });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Unit already exists.' });
    }

    const unit = await Unit.create({
      name: trimmedName,
      isCustom: true,
      createdBy: req.user!._id
    });

    return res.status(201).json({ success: true, message: 'Unit added.', unit });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
