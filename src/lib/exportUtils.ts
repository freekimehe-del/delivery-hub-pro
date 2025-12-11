import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Types ---
interface ExportColumn {
    header: string;
    key: string;
    width?: number;
}

// --- Excel Export ---
export const exportToExcel = (data: any[], fileName: string, sheetName: string = 'Sheet1') => {
    // 1. Create a new workbook
    const wb = XLSX.utils.book_new();

    // 2. Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // 3. Append worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // 4. Write file
    XLSX.writeFile(wb, `${fileName}.xlsx`);
};

// --- PDF Export ---
export const exportToPDF = async (
    data: any[],
    columns: ExportColumn[],
    title: string,
    fileName: string
) => {
    const doc = new jsPDF();

    // Add Logo
    try {
        const logoUrl = '/kohesar_logo.png';
        const img = new Image();
        img.src = logoUrl;
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = resolve; // Continue even if logo fails
        });

        // Aspect ratio for logo (width 50mm, calculate height)
        const logoWidth = 50;
        const logoHeight = (img.height * logoWidth) / img.width;
        doc.addImage(img, 'PNG', 14, 10, logoWidth, logoHeight);
    } catch (e) {
        console.warn("Logo load failed", e);
    }

    doc.setFontSize(18);
    doc.text(title, 14, 35); // Moved down to accommodate logo
    doc.setFontSize(11);
    doc.setTextColor(100);
    const dateStr = new Date().toLocaleString();
    doc.text(`Generated on: ${dateStr}`, 14, 42);

    const tableHead = [columns.map(c => c.header)];
    const tableBody = data.map(row =>
        columns.map(col => {
            const val = row[col.key];
            return val !== undefined && val !== null ? String(val) : '';
        })
    );

    autoTable(doc, {
        head: tableHead,
        body: tableBody,
        startY: 45, // Moved down
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save(`${fileName}.pdf`);
};

// --- Helpers ---
export const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
};
