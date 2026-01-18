const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// Ensure exports directory exists
const exportsDir = path.join(__dirname, '../exports');
if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
}

async function exportStudentsToExcel(students, academyName) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Students');

    // Define columns
    worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'First Name', key: 'first_name', width: 20 },
        { header: 'Last Name', key: 'last_name', width: 20 },
        { header: 'Date of Birth', key: 'dob', width: 15 },
        { header: 'Batting Style', key: 'batting_style', width: 15 },
        { header: 'Bowling Style', key: 'bowling_style', width: 15 },
        { header: 'Batch', key: 'batch_name', width: 20 },
        { header: 'Parent Phone', key: 'parent_phone', width: 15 }
    ];

    // Add rows
    students.forEach(student => {
        worksheet.addRow(student);
    });

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }
    };

    // Save file
    const filename = `students_${Date.now()}.xlsx`;
    const filepath = path.join(exportsDir, filename);
    await workbook.xlsx.writeFile(filepath);

    return filepath;
}

async function exportPaymentsToExcel(payments, academyName) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payments');

    // Define columns
    worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Student Name', key: 'student_name', width: 25 },
        { header: 'Amount', key: 'amount', width: 12 },
        { header: 'Discount', key: 'discount_amount', width: 12 },
        { header: 'Status', key: 'status', width: 12 },
        { header: 'Due Date', key: 'due_date', width: 15 },
        { header: 'Payment Date', key: 'payment_date', width: 15 },
        { header: 'Payment Mode', key: 'payment_mode', width: 15 }
    ];

    // Add rows
    payments.forEach(payment => {
        worksheet.addRow({
            ...payment,
            student_name: `${payment.first_name} ${payment.last_name}`
        });
    });

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }
    };

    // Save file
    const filename = `payments_${Date.now()}.xlsx`;
    const filepath = path.join(exportsDir, filename);
    await workbook.xlsx.writeFile(filepath);

    return filepath;
}

async function exportPerformanceToExcel(performances, academyName) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Performance');

    // Define columns
    worksheet.columns = [
        { header: 'Student', key: 'student_name', width: 25 },
        { header: 'Matches', key: 'matches', width: 10 },
        { header: 'Runs', key: 'total_runs', width: 12 },
        { header: 'Highest Score', key: 'highest_score', width: 15 },
        { header: 'Strike Rate', key: 'strike_rate', width: 15 },
        { header: 'Wickets', key: 'total_wickets', width: 12 },
        { header: 'Economy Rate', key: 'economy_rate', width: 15 },
        { header: 'Catches', key: 'total_catches', width: 10 }
    ];

    // Add rows
    performances.forEach(perf => {
        worksheet.addRow({
            student_name: `${perf.first_name} ${perf.last_name}`,
            ...perf
        });
    });

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }
    };

    // Save file
    const filename = `performance_${Date.now()}.xlsx`;
    const filepath = path.join(exportsDir, filename);
    await workbook.xlsx.writeFile(filepath);

    return filepath;
}

module.exports = {
    exportStudentsToExcel,
    exportPaymentsToExcel,
    exportPerformanceToExcel
};
