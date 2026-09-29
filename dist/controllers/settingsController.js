"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addUnit = exports.getUnits = exports.addCategory = exports.getCategories = exports.DEFAULT_UNITS = exports.DEFAULT_CATEGORIES = void 0;
const Category_1 = require("../models/Category");
const Unit_1 = require("../models/Unit");
exports.DEFAULT_CATEGORIES = [
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
exports.DEFAULT_UNITS = [
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
const getCategories = async (req, res) => {
    try {
        const customCategories = await Category_1.Category.find().sort({ name: 1 });
        const customNames = customCategories.map(c => c.name);
        // Merge default categories with custom categories
        const allCategories = Array.from(new Set([...exports.DEFAULT_CATEGORIES, ...customNames]));
        return res.status(200).json({
            success: true,
            categories: allCategories,
            defaults: exports.DEFAULT_CATEGORIES,
            custom: customCategories
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to fetch categories.' });
    }
};
exports.getCategories = getCategories;
const addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Category name is required.' });
        }
        const trimmedName = name.trim();
        if (exports.DEFAULT_CATEGORIES.includes(trimmedName)) {
            return res.status(400).json({ success: false, message: 'This is already a default category.' });
        }
        const existing = await Category_1.Category.findOne({ name: trimmedName });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Category already exists.' });
        }
        const category = await Category_1.Category.create({
            name: trimmedName,
            isCustom: true,
            createdBy: req.user._id
        });
        return res.status(201).json({ success: true, message: 'Category added.', category });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
exports.addCategory = addCategory;
const getUnits = async (req, res) => {
    try {
        const customUnits = await Unit_1.Unit.find().sort({ name: 1 });
        const customNames = customUnits.map(u => u.name);
        const allUnits = Array.from(new Set([...exports.DEFAULT_UNITS, ...customNames]));
        return res.status(200).json({
            success: true,
            units: allUnits,
            defaults: exports.DEFAULT_UNITS,
            custom: customUnits
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to fetch units.' });
    }
};
exports.getUnits = getUnits;
const addUnit = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Unit name is required.' });
        }
        const trimmedName = name.trim();
        if (exports.DEFAULT_UNITS.includes(trimmedName)) {
            return res.status(400).json({ success: false, message: 'This is already a default unit.' });
        }
        const existing = await Unit_1.Unit.findOne({ name: trimmedName });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Unit already exists.' });
        }
        const unit = await Unit_1.Unit.create({
            name: trimmedName,
            isCustom: true,
            createdBy: req.user._id
        });
        return res.status(201).json({ success: true, message: 'Unit added.', unit });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
exports.addUnit = addUnit;
