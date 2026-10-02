"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSiteImagesPDF = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Downloads image buffer safely from URL or local path.
 */
async function fetchImageBuffer(imageUrl) {
    try {
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            const res = await axios_1.default.get(imageUrl, { responseType: 'arraybuffer', timeout: 8000 });
            return Buffer.from(res.data);
        }
        else if (imageUrl.startsWith('/uploads/')) {
            const localPath = path_1.default.join(__dirname, '../../', imageUrl);
            if (fs_1.default.existsSync(localPath)) {
                return fs_1.default.readFileSync(localPath);
            }
        }
        return null;
    }
    catch (e) {
        console.error('Error fetching image for PDF:', imageUrl, e);
        return null;
    }
}
const generateSiteImagesPDF = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new pdfkit_1.default({ margin: 20, size: 'A4', autoFirstPage: true, bufferPages: true });
            const buffers = [];
            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            const site = data.site;
            const images = data.images || [];
            const formattedDate = new Date().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            const headerText = `${site.siteName}${site.workOrderNumber ? ' (' + site.workOrderNumber + ')' : ''} Photographs during visit dated ${formattedDate}`;
            const drawPageHeaderAndBorder = () => {
                // Outer Page Border Line (matching reference image)
                doc.rect(20, 20, 555.28, 801.89).lineWidth(1).strokeColor('#000000').stroke();
                // Centered Header Title Text at Top (matching reference image)
                doc.fillColor('#000000').fontSize(11).font('Helvetica-Bold').text(headerText, 30, 35, {
                    align: 'center',
                    width: 535.28
                });
            };
            drawPageHeaderAndBorder();
            if (images.length === 0) {
                doc.fillColor('#64748B').fontSize(12).font('Helvetica').text('No site photos available for this project.', 30, 100, { align: 'center', width: 535.28 });
                doc.end();
                return;
            }
            // 4 Photos Per Page (2x2 Grid) Layout matching reference image
            const boxWidth = 260;
            const boxHeight = 360;
            const xPositions = [32, 303]; // Column 0 (32), Column 1 (303)
            const yPositions = [60, 435]; // Row 0 (60), Row 1 (435)
            for (let i = 0; i < images.length; i++) {
                const posOnPage = i % 4;
                // Create new page after every 4 images
                if (i > 0 && posOnPage === 0) {
                    doc.addPage();
                    drawPageHeaderAndBorder();
                }
                const col = posOnPage % 2; // 0 or 1
                const row = Math.floor(posOnPage / 2); // 0 or 1
                const cardX = xPositions[col];
                const cardY = yPositions[row];
                const imgObj = images[i];
                const imgBuffer = await fetchImageBuffer(imgObj.imageUrl);
                if (imgBuffer) {
                    try {
                        // Render image filling the 2x2 cell perfectly without extra borders or backgrounds
                        doc.image(imgBuffer, cardX, cardY, {
                            fit: [boxWidth, boxHeight],
                            align: 'center',
                            valign: 'center'
                        });
                    }
                    catch (imgErr) {
                        console.error('PDF 2x2 image render error:', imgErr);
                        doc.fillColor('#94A3B8').fontSize(9).text('Image Format Error', cardX, cardY + boxHeight / 2, { align: 'center', width: boxWidth });
                    }
                }
                else {
                    doc.fillColor('#94A3B8').fontSize(9).text('Image Unavailable', cardX, cardY + boxHeight / 2, { align: 'center', width: boxWidth });
                }
            }
            doc.end();
        }
        catch (err) {
            reject(err);
        }
    });
};
exports.generateSiteImagesPDF = generateSiteImagesPDF;
