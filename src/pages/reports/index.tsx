import React from 'react';
import { Typography, Card, Tabs } from '@arco-design/web-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Report1 from './report1';
import Report2 from './report2';
import Report3 from './report3';
import Report4 from './report4';
import Report5 from './report5';
import Report6 from './report6';
import Report7 from './report7';

const TabPane = Tabs.TabPane;

function Example() {
  const exportExcel = async (c, d, t) => {
    console.log("Report Hit");
    /*
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    worksheet.mergeCells('A1:C1');
    const titleRow = worksheet.getCell('A1');
    titleRow.value = t;
    titleRow.font = { size: 20, bold: true };
    titleRow.alignment = { horizontal: 'center', vertical: 'middle' };

    const headerRow = worksheet.addRow(c.map((e) => e.title));

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

    d.forEach((row) => {
      worksheet.addRow(c.map((e) => row[e.dataIndex]));
    });

    worksheet.columns.forEach((column) => {
      column.width = 30;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `${t}.xlsx`);
    */
  };

  return (
    <Card style={{ height: '100%', minHeight: '80vh', overflow: 'auto' }}>
      <Tabs
        defaultActiveTab="1"
        destroyOnHide={true}
        overflow="wrap"
      >
        <TabPane key="1" title="LEARNER ENROLMENTS + MONTH + YEAR">
          <Report1 />
        </TabPane>
        <TabPane key="2" title="WORKSHOPS BY REGION + YEAR">
          <Report2 />
        </TabPane>
        <TabPane key="3" title="SCHOOL + LEARNER NUMBERS + YEAR">
          <Report3 />
        </TabPane>
        <TabPane key="4" title="SCHOOL + LEARNERS  + YEAR">
          <Report4 />
        </TabPane>
        <TabPane key="5" title="TUTOR + LEARNER NUMBERS + YEAR">
          <Report5 />
        </TabPane>
        <TabPane key="6" title="ETHNICITY + LEARNER NUMBERS + YEAR">
          <Report6 />
        </TabPane>
        <TabPane key="7" title="CUSTOM REPORT">
          <Report7 />
        </TabPane>
      </Tabs>
    </Card>
  );
}

export default Example;
