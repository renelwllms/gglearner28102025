import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export async function exportExcel(columns: any[], data: any[], title: string) {
  console.log("Report Hit");

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  // Title row - dynamically merge cells based on number of columns
  const columnCount = columns.length;
  const lastColumn = String.fromCharCode(64 + columnCount); // A=65, so 64+1=A, 64+2=B, etc.
  worksheet.mergeCells(`A1:${lastColumn}1`);
  const titleRow = worksheet.getCell('A1');
  titleRow.value = title;
  titleRow.font = { size: 20, bold: true };
  titleRow.alignment = { horizontal: 'center', vertical: 'middle' };

  // Headers
  const headerRow = worksheet.addRow(columns.map((e) => e.title));
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'ED45A0' },
    };
    cell.font = {
      color: { argb: 'FFFFFFFF' },
      bold: true,
    };
  });
  headerRow.height = 25;

  // Data rows
  data.forEach((row) => {
    worksheet.addRow(columns.map((e) => row[e.dataIndex]));
  });

  worksheet.columns.forEach((column) => {
    column.width = 30;
  });

  // Download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `${title}.xlsx`);
}
