"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSitePDFReport = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const generateSitePDFReport = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new pdfkit_1.default({ margin: 40, size: 'A4' });
            const buffers = [];
            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            const company = data.companyName || 'R&D CONSTRUCTIONS';
            const site = data.site;
            // Header Banner
            doc.rect(0, 0, 595.28, 70).fill('#1E293B');
            doc.fillColor('#F59E0B').fontSize(22).font('Helvetica-Bold').text(company, 40, 18);
            doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica').text('SITE COST & P&L MANAGEMENT REPORT', 40, 44);
            // Report Generation Date
            const formattedDate = new Date().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            doc.fillColor('#94A3B8').fontSize(9).text(`Generated: ${formattedDate}`, 400, 44, { align: 'right' });
            let y = 85;
            // Section 1: Site Metadata Box
            doc.rect(40, y, 515, 95).lineWidth(1).strokeColor('#CBD5E1').fillAndStroke('#F8FAFC', '#CBD5E1');
            doc.fillColor('#0F172A').fontSize(14).font('Helvetica-Bold').text(site.siteName, 50, y + 10);
            doc.fillColor('#64748B').fontSize(10).font('Helvetica').text(`Client: ${site.clientName}`, 50, y + 30);
            doc.text(`Work Order #: ${site.workOrderNumber}`, 50, y + 45);
            if (site.location)
                doc.text(`Location: ${site.location}`, 50, y + 60);
            doc.fillColor('#64748B').fontSize(10).font('Helvetica').text(`Status: ${site.status}`, 330, y + 10);
            doc.text(`Contract Value: ₹${(site.contractValue || 0).toLocaleString('en-IN')}`, 330, y + 30);
            const startStr = site.startDate ? new Date(site.startDate).toLocaleDateString('en-IN') : 'N/A';
            doc.text(`Start Date: ${startStr}`, 330, y + 45);
            if (site.closedAt) {
                doc.text(`Closed Date: ${new Date(site.closedAt).toLocaleDateString('en-IN')}`, 330, y + 60);
            }
            y += 110;
            // Section 2: Financial Summary KPI Cards
            doc.fillColor('#0F172A').fontSize(12).font('Helvetica-Bold').text('FINANCIAL P&L SUMMARY', 40, y);
            y += 18;
            const cardWidth = 120;
            const cardHeight = 50;
            // Card 1: Contract Value
            doc.rect(40, y, cardWidth, cardHeight).fillAndStroke('#EFF6FF', '#93C5FD');
            doc.fillColor('#1E40AF').fontSize(8).font('Helvetica-Bold').text('CONTRACT VALUE', 45, y + 8);
            doc.fillColor('#1E3A8A').fontSize(12).font('Helvetica-Bold').text(`₹${(site.contractValue || 0).toLocaleString('en-IN')}`, 45, y + 24);
            // Card 2: Total Cost
            doc.rect(170, y, cardWidth, cardHeight).fillAndStroke('#FEF2F2', '#FCA5A5');
            doc.fillColor('#991B1B').fontSize(8).font('Helvetica-Bold').text('TOTAL SITE COST', 175, y + 8);
            doc.fillColor('#7F1D1D').fontSize(12).font('Helvetica-Bold').text(`₹${data.totalCost.toLocaleString('en-IN')}`, 175, y + 24);
            // Card 3: Gross Profit
            const profitBg = data.grossProfit >= 0 ? '#ECFDF5' : '#FEF2F2';
            const profitBorder = data.grossProfit >= 0 ? '#6EE7B7' : '#FCA5A5';
            const profitText = data.grossProfit >= 0 ? '#065F46' : '#991B1B';
            doc.rect(300, y, cardWidth, cardHeight).fillAndStroke(profitBg, profitBorder);
            doc.fillColor(profitText).fontSize(8).font('Helvetica-Bold').text('GROSS PROFIT', 305, y + 8);
            doc.fillColor(profitText).fontSize(12).font('Helvetica-Bold').text(`₹${data.grossProfit.toLocaleString('en-IN')}`, 305, y + 24);
            // Card 4: Profit Margin %
            doc.rect(430, y, cardWidth, cardHeight).fillAndStroke(profitBg, profitBorder);
            doc.fillColor(profitText).fontSize(8).font('Helvetica-Bold').text('PROFIT %', 435, y + 8);
            doc.fillColor(profitText).fontSize(12).font('Helvetica-Bold').text(`${data.profitPercentage}%`, 435, y + 24);
            y += 65;
            // Section 3: Category Expenses Breakdown
            doc.fillColor('#0F172A').fontSize(12).font('Helvetica-Bold').text('CATEGORY COST BREAKDOWN', 40, y);
            y += 18;
            // Table Header
            doc.rect(40, y, 515, 20).fill('#334155');
            doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold');
            doc.text('Category', 50, y + 5);
            doc.text('Entries Count', 250, y + 5);
            doc.text('Total Amount (INR)', 400, y + 5, { align: 'right' });
            y += 20;
            data.categoryBreakdown.forEach((cat, index) => {
                const rowBg = index % 2 === 0 ? '#F8FAFC' : '#FFFFFF';
                doc.rect(40, y, 515, 18).fill(rowBg);
                doc.fillColor('#1E293B').fontSize(9).font('Helvetica');
                doc.text(cat._id, 50, y + 4);
                doc.text(cat.count.toString(), 250, y + 4);
                doc.text(`₹${cat.totalAmount.toLocaleString('en-IN')}`, 400, y + 4, { align: 'right' });
                y += 18;
            });
            y += 15;
            // Check page overflow
            if (y > 680) {
                doc.addPage();
                y = 40;
            }
            // Section 4: Item-Wise Quantity & Cost Aggregation
            doc.fillColor('#0F172A').fontSize(12).font('Helvetica-Bold').text('ITEM-WISE QUANTITY & COST SUMMARY', 40, y);
            y += 18;
            // Table Header
            doc.rect(40, y, 515, 20).fill('#1E293B');
            doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold');
            doc.text('Item Description', 50, y + 5);
            doc.text('Category', 200, y + 5);
            doc.text('Total Qty', 310, y + 5);
            doc.text('Avg Rate', 390, y + 5);
            doc.text('Total Cost (₹)', 460, y + 5, { align: 'right' });
            y += 20;
            data.items.forEach((item, index) => {
                if (y > 750) {
                    doc.addPage();
                    y = 40;
                    // Redraw header
                    doc.rect(40, y, 515, 20).fill('#1E293B');
                    doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold');
                    doc.text('Item Description', 50, y + 5);
                    doc.text('Category', 200, y + 5);
                    doc.text('Total Qty', 310, y + 5);
                    doc.text('Avg Rate', 390, y + 5);
                    doc.text('Total Cost (₹)', 460, y + 5, { align: 'right' });
                    y += 20;
                }
                const rowBg = index % 2 === 0 ? '#F8FAFC' : '#FFFFFF';
                doc.rect(40, y, 515, 18).fill(rowBg);
                doc.fillColor('#1E293B').fontSize(9).font('Helvetica');
                doc.text(item.itemName, 50, y + 4, { width: 145 });
                doc.text(item.category, 200, y + 4);
                doc.text(`${item.totalQuantity} ${item.unit}`, 310, y + 4);
                doc.text(`₹${item.averageRate.toLocaleString('en-IN')}`, 390, y + 4);
                doc.text(`₹${item.totalCost.toLocaleString('en-IN')}`, 460, y + 4, { align: 'right' });
                y += 18;
            });
            y += 15;
            if (y > 680) {
                doc.addPage();
                y = 40;
            }
            // Section 5: Entry Summary by Users
            if (data.userSummary && data.userSummary.length > 0) {
                doc.fillColor('#0F172A').fontSize(12).font('Helvetica-Bold').text('USER ENTRY CONTRIBUTION SUMMARY', 40, y);
                y += 18;
                doc.rect(40, y, 515, 20).fill('#475569');
                doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold');
                doc.text('User Name', 50, y + 5);
                doc.text('Role', 220, y + 5);
                doc.text('Entries Logged', 320, y + 5);
                doc.text('Total Entered (₹)', 420, y + 5, { align: 'right' });
                y += 20;
                data.userSummary.forEach((usr, index) => {
                    const rowBg = index % 2 === 0 ? '#F8FAFC' : '#FFFFFF';
                    doc.rect(40, y, 515, 18).fill(rowBg);
                    doc.fillColor('#1E293B').fontSize(9).font('Helvetica');
                    doc.text(usr.userName, 50, y + 4);
                    doc.text(usr.userRole, 220, y + 4);
                    doc.text(usr.count.toString(), 320, y + 4);
                    doc.text(`₹${usr.totalAmount.toLocaleString('en-IN')}`, 420, y + 4, { align: 'right' });
                    y += 18;
                });
            }
            // Footer stamp
            doc.fontSize(8).fillColor('#94A3B8').text('Generated via R2R – Raw to Refined Site Expense & P&L Management System', 40, 780, { align: 'center', width: 515 });
            doc.end();
        }
        catch (err) {
            reject(err);
        }
    });
};
exports.generateSitePDFReport = generateSitePDFReport;
