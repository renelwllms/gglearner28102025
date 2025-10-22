import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Card, Button, Table, TableColumnProps, Message } from '@arco-design/web-react';
import * as services from '@/services';
import { useSelector } from 'react-redux';
import styles from './index.module.less';
import Row from '@arco-design/web-react/es/Grid/row';
import { DatePicker } from '@arco-design/web-react';
const { YearPicker } = DatePicker;
import { exportExcel } from './excelExport';
function Report1() {
  const columns: TableColumnProps[] = [
    {
      title: 'Month',
      dataIndex: 'Month',
      ellipsis: true,
    },
    {
      title: 'Workshop Learner Enrolments',
      dataIndex: 'WorkshopLearnerEnrollments',
      ellipsis: true,
    },
    {
      title: 'Remote Learner Enrolments',
      dataIndex: 'LearnerEnrollments',
      ellipsis: true,
    },

    {
      title: 'Withdrawn/Did Not Complete',
      dataIndex: 'TotalWithdrawsCount',
      ellipsis: true,
    },
  ];
  const token = useSelector((state: any) => state.token);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [time, setTime] = useState(String(moment().year()));

  const getList = () => {
    setLoading(true);
    services.g
      .getReport1({
        year: time,
      })
      .then((res) => {
        setData(res?.data || []);
      })
      .catch((error) => {
        console.error('Error loading report 1:', error);
        Message.error('Failed to load learner enrolments report. Please try again.');
        setData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleExport = async () => {
    try {
      await exportExcel(columns, data, 'LEARNER ENROLMENTS + MONTH + YEAR');
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
        <YearPicker
          value={time}
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
        pagination={false}
        rowClassName={(row) =>
          row?.Month === 'Total' ? styles['is-summary'] : ''
        }
      />
    </Card>
  );
}

export default Report1;
