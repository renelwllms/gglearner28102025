import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Card, Button, Table, TableColumnProps, Select, Message } from '@arco-design/web-react';
import * as services from '@/services';
import { useSelector } from 'react-redux';
import styles from './index.module.less';
import Row from '@arco-design/web-react/es/Grid/row';
import { DatePicker } from '@arco-design/web-react';
import { exportExcel } from './excelExport';
const { YearPicker } = DatePicker;
function Report1() {
  const token = useSelector((state: any) => state.token);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [time, setTime] = useState(String(moment().year()));
  const [schoolName, setSchoolName] = useState('');
  const getList = () => {
    if (!time) return Message.warning('Please select a year');

    if (!schoolName) return;
    setLoading(true);
    services.g
      .getReport4({
        year: time,
        schoolName: schoolName,
      })
      .then((res) => {
        setData(res?.data || []);
      })
      .catch((error) => {
        console.error('Error loading report 4:', error);
        Message.error('Failed to load school learners report. Please try again.');
        setData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getOptions();
  }, []);
  const [schoolOption, setSchoolOption] = useState([]);

  const getOptions = () => {
    services.g.getSchool({}).then((res) => {
      setSchoolOption(res?.data || []);
    }).catch((error) => {
      console.error('Error loading schools:', error);
      Message.error('Failed to load school list.');
      setSchoolOption([]);
    });
  };

  const handleExport = async () => {
    try {
      await exportExcel(columns, data, 'SCHOOL + LEARNERS  + YEAR');
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
  }, [token, time, schoolName]);
  const columns: TableColumnProps[] = [
    {
      title: `${schoolName} - ${time}`,
      dataIndex: 'LearnerName',
    },
    // {
    //   title: 'Date Of Birth',
    //   dataIndex: 'DOB',
    //   ellipsis: true,
    //   render: (e) => moment(e).format('DD/MM/YYYY'),
    // },
    // {
    //   title: 'Gender',
    //   dataIndex: 'Gender',
    //   ellipsis: true,
    // },
    // {
    //   title: 'Ethnicity',
    //   dataIndex: 'Ethnicity',
    //   ellipsis: true,
    // },
    // {
    //   title: 'Email',
    //   dataIndex: 'Email',
    //   ellipsis: true,
    // },
  ];
  return (
    <Card className={styles['reports-result']}>
      <Row>
        <Select
          style={{ width: 200, marginBottom: 10, marginRight: 10 }}
          labelInValue
          showSearch
          allowClear
          onChange={(val) => setSchoolName(val.label)}
          options={schoolOption.map((it) => ({
            label: it.SchoolName,
            value: it.SchoolNumber,
          }))}
          allowCreate={{
            formatter: (inputValue) => {
              return {
                value: inputValue,
                label: inputValue,
              };
            },
          }}
          filterOption={(inputValue, option) =>
            option.props.value?.label
              ?.toLowerCase()
              .indexOf(inputValue.toLowerCase()) >= 0 ||
            option.props?.children
              .toLowerCase()
              .indexOf(inputValue.toLowerCase()) >= 0
          }
          placeholder="SchoolName:"
          size="mini"
        />
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
