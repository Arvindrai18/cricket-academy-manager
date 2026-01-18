const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Ensure receipts directory exists
const receiptsDir = path.join(__dirname, '../receipts');
if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
}

async function generateReceipt(paymentData, academyData, studentData) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const filename = `receipt_${paymentData.id}_${Date.now()}.pdf`;
        const filepath = path.join(receiptsDir, filename);

        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // Header
        doc.fontSize(20).text('FEE RECEIPT', { align: 'center' });
        doc.moveDown();

        // Academy Info
        doc.fontSize(12).text(academyData.name, { align: 'center' });
        if (academyData.phone) {
            doc.fontSize(10).text(`Phone: ${academyData.phone}`, { align: 'center' });
        }
        doc.moveDown();

        // Divider
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        // Receipt Details
        doc.fontSize(10);
        const leftCol = 50;
        const rightCol = 300;
        let y = doc.y;

        doc.text('Receipt No:', leftCol, y);
        doc.text(`#${paymentData.id}`, rightCol, y);
        y += 20;

        doc.text('Date:', leftCol, y);
        doc.text(paymentData.payment_date || new Date().toISOString().split('T')[0], rightCol, y);
        y += 20;

        doc.text('Student Name:', leftCol, y);
        doc.text(`${studentData.first_name} ${studentData.last_name}`, rightCol, y);
        y += 20;

        doc.text('Payment Mode:', leftCol, y);
        doc.text(paymentData.payment_mode || 'CASH', rightCol, y);
        y += 40;

        // Amount Box
        doc.rect(50, y, 500, 60).stroke();
        y += 20;
        doc.fontSize(12).text('Amount Paid:', leftCol + 10, y);
        doc.fontSize(16).text(`₹ ${paymentData.amount}`, rightCol, y);
        y += 60;

        if (paymentData.discount_amount && paymentData.discount_amount > 0) {
            doc.fontSize(10).text(`(Discount Applied: ₹${paymentData.discount_amount})`, leftCol, y);
            y += 20;
        }

        if (paymentData.installment_number && paymentData.installment_number > 1) {
            doc.fontSize(10).text(`Installment #${paymentData.installment_number}`, leftCol, y);
            y += 20;
        }

        y += 20;

        // Footer
        doc.moveTo(50, y).lineTo(550, y).stroke();
        y += 20;
        doc.fontSize(9).text('This is a computer-generated receipt and does not require a signature.', { align: 'center' });

        // End document
        doc.end();

        stream.on('finish', () => {
            resolve(filepath);
        });

        stream.on('error', (error) => {
            reject(error);
        });
    });
}

module.exports = { generateReceipt };
