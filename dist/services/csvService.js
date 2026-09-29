"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateExpensesCSV = void 0;
const generateExpensesCSV = (expenses) => {
    const headers = [
        'Date',
        'Item Name',
        'Category',
        'Quantity',
        'Unit',
        'Rate (INR)',
        'Amount (INR)',
        'Vendor/Supplier',
        'Payment Method',
        'Notes',
        'Logged By',
        'Bill Attachment URL'
    ];
    const rows = expenses.map((e) => {
        const user = e.createdBy;
        const userName = typeof user === 'object' && user?.name ? user.name : 'N/A';
        const dateStr = e.date ? new Date(e.date).toISOString().split('T')[0] : '';
        return [
            `"${dateStr}"`,
            `"${(e.itemName || '').replace(/"/g, '""')}"`,
            `"${(e.category || '').replace(/"/g, '""')}"`,
            e.quantity,
            `"${e.unit}"`,
            e.rate,
            e.amount,
            `"${(e.vendor || '').replace(/"/g, '""')}"`,
            `"${e.paymentMethod || 'CASH'}"`,
            `"${(e.notes || '').replace(/"/g, '""')}"`,
            `"${userName.replace(/"/g, '""')}"`,
            `"${e.billImageUrl || ''}"`
        ].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
};
exports.generateExpensesCSV = generateExpensesCSV;
