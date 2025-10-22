import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Card, Button, Table, Message } from '@arco-design/web-react';
import * as services from '@/services';
import { useSelector } from 'react-redux';
import styles from './index.module.less';
import Row from '@arco-design/web-react/es/Grid/row';
import { DatePicker } from '@arco-design/web-react';
import { exportExcel } from './excelExport';
const { RangePicker } = DatePicker;
function Report1() {
  const [columns, setColumns] = useState([]);
  const token = useSelector((state: any) => state.token);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [time, setTime] = useState([
    String(moment().year()),
    String(moment().year()),
  ]);

  const getList = () => {
    setLoading(true);
    services.g
      .getReport3(
        time?.length > 0
          ? {
              startYear: time[0],
              endYear: time[1],
            }
          : {}
      )
      .then((res) => {
        const { headers, data: rowData } = res;

        // Set columns using the headers
        const tableColumns = headers.map((header) => ({
          title: header,
          dataIndex: header,
          key: header,
          width: 150,
          ellipsis: true,
        }));
        if (tableColumns?.length) {
          tableColumns[0].fixed = 'left';
        }

        setColumns(tableColumns);

        // Set data rows
        const tableData = rowData.map((row, index) => {
          let rowObject = { key: index };
          headers.forEach((header, i) => {
            rowObject[header] = row[i];
          });
          return rowObject;
        });
        setData(tableData);
      })
      .catch((error) => {
        console.error('Error loading report 3:', error);
        Message.error('Failed to load school learner numbers report. Please try again.');
        setColumns([]);
        setData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleExport = async () => {
    try {
      await exportExcel(columns, data, 'SCHOOL + LEARNER NUMBERS + YEAR');
      Message.success('Excel file exported successfully!');
    } catch (error) {
      console.error('Error exporting report:', error);
      Message.error('Failed to export Excel file. Please try again.');
    }
  };

  useEffect(() => {
    if (token) {
      getList();
    }
  }, [token, time]);

  return (
    <Card className={styles['reports-result']}>
      <Row>
        <RangePicker
          value={time}
          mode="year"
          style={{ width: 200, marginBottom: 10 }}
          onChange={(d) => {
            setTime(d);
          }}
          size="mini"
        />
        <Button
          onClick={() => getList()}
          type="primary"
          size="mini"
          style={{ marginLeft: 20 }}
        >
          {'Refresh'}
        </Button>
        <Button
          size="mini"
          onClick={handleExport}
          type="primary"
          style={{ marginLeft: 20 }}
        >
          {'Export Excel'}
        </Button>
      </Row>

      <Table
        columns={columns}
        data={data}
        loading={loading}
        border={{
          wrapper: true,
          cell: true,
        }}
        scroll={{
          y: 1250,
        }}
        pagination={false}
        rowClassName={(row) =>
          row?.Month === 'Total' ? styles['is-summary'] : ''
        }
      />
    </Card>
  );
}

export default Report1;
