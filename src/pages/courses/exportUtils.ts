import ExcelJS from 'exceljs';

export const exportToExcel = async (data: any[], filename: string, sheetName: string, columns: any[]) => {
  try {
    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Add columns
    worksheet.columns = columns;

    // Style header row
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF165DFF' },
    };
    worksheet.getRow(1).font = { ...worksheet.getRow(1).font, color: { argb: 'FFFFFFFF' } };

    // Add data rows
    data.forEach((item) => {
      worksheet.addRow(item);
    });

    // Auto-fit columns
    worksheet.columns.forEach((column: any) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell: any) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength + 2;
    });

    // Add filters
    worksheet.autoFilter = {
      from: 'A1',
      to: String.fromCharCode(64 + columns.length) + '1',
    };

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
};

export const exportCoursesToExcel = async (courses: any[], unitStandards: any[]) => {
  const data = courses.map((course) => {
    // Get unit standard names
    const unitNames = course.UnitStandardIDs?.map((id: number) => {
      const us = unitStandards.find((u) => u.UnitStandardID === id);
      return us ? `${us.US} - ${us.USName}` : '';
    }).join('; ') || 'None';

    return {
      CourseName: course.CourseName,
      CourseDetails: course.CourseDetails || '',
      CourseLevel: course.CourseLevel,
      CourseCredits: course.CourseCredits,
      UnitStandards: unitNames,
    };
  });

  const columns = [
    { header: 'Course Name', key: 'CourseName', width: 30 },
    { header: 'Course Details', key: 'CourseDetails', width: 40 },
    { header: 'Level', key: 'CourseLevel', width: 10 },
    { header: 'Credits', key: 'CourseCredits', width: 10 },
    { header: 'Unit Standards', key: 'UnitStandards', width: 60 },
  ];

  await exportToExcel(data, 'Courses', 'Courses', columns);
};

export const exportUnitStandardsToExcel = async (units: any[]) => {
  const data = units.map((unit) => ({
    US: unit.US,
    USName: unit.USName,
    USDescription: unit.USDescription || '',
    USLevel: unit.USLevel,
    USCredits: unit.USCredits,
    USVersion: unit.USVersion || '',
  }));

  const columns = [
    { header: 'Unit Standard', key: 'US', width: 15 },
    { header: 'Name', key: 'USName', width: 40 },
    { header: 'Description', key: 'USDescription', width: 50 },
    { header: 'Level', key: 'USLevel', width: 10 },
    { header: 'Credits', key: 'USCredits', width: 10 },
    { header: 'Version', key: 'USVersion', width: 15 },
  ];

  await exportToExcel(data, 'Unit_Standards', 'Unit Standards', columns);
};
