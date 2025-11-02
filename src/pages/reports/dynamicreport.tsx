import React, { useEffect, useState } from 'react';
import { PageHeader, Typography, Form, Input, Select, DatePicker, Button, Space, Progress, Statistic, Table, Card, Message } from '@arco-design/web-react';
import { IconDown, IconRight, IconPlus, IconRefresh, IconSearch } from '@arco-design/web-react/icon';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import ResizableTable from '@/components/ResizableTable';
import * as services from '@/services';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const Option = Select.Option;
const { useForm } = Form;

export default function LearnerResults() {
  const [form] = useForm();
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [columnsKey, setColumnsKey] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [dataSum, setDataSum] = useState([]);
  const [totalPrecentage, setTotalPrecentage] = useState(0.0);
  const token = useSelector((state: any) => state.token);
  const [formParams, setFormParams] = useState({});
  const [pagination, setPagination] = useState({
    total: 0,
    pageSize: 10,
    current: 1,
  });

  // Options for dropdowns
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [tutorOptions, setTutorOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [ethnicityOptions, setEthnicityOptions] = useState([
    'NZ European', 'Maori', 'Cook Island Maori', 'Niuean', 'Samoan',
    'Tongan', 'Fijian', 'Tokelauan', 'Chinese', 'Indian', 'Japanese',
    'Korean', 'Vietnamese', 'Filipino', 'Malaysian', 'Indonesian', 'Thai',
    'Middle Eastern/Latin American/African', 'Other'
  ]);

  useEffect(() => {
    if (token) {
      getList();
      loadSchools();
      loadTutors();
      loadRegions();
    }
  }, [token]);

  const handleFilterChange = (values) => {
    setSelectedFilters(values);
  };

  const loadSchools = async () => {
    try {
      const res = await services.g.getSchool();
      if (res.code === 0) {
        const sorted = (res.data || []).sort((a, b) => {
          const nameA = a.SchoolName?.toLowerCase() || '';
          const nameB = b.SchoolName?.toLowerCase() || '';
          return nameA.localeCompare(nameB);
        });
        setSchoolOptions(sorted);
      }
    } catch (error) {
      console.error('Error loading schools:', error);
    }
  };

  const loadTutors = async () => {
    try {
      const res = await services.g.getAllTutorList();
      if (res.code === 0) {
        const sorted = (res.data || []).sort((a, b) => {
          const nameA = a.TutorName?.toLowerCase() || '';
          const nameB = b.TutorName?.toLowerCase() || '';
          return nameA.localeCompare(nameB);
        });
        setTutorOptions(sorted);
      }
    } catch (error) {
      console.error('Error loading tutors:', error);
    }
  };

  const loadRegions = async () => {
    try {
      // Get unique regions from student data
      const res = await services.student.getReport({ pageSize: 10000, isReport: 1 });
      if (res.code === 0 && res.data && res.data[1]) {
        const uniqueRegions = [...new Set(res.data[1]
          .map(student => student.Region)
          .filter(region => region && region.trim() !== ''))]
          .sort();
        setRegionOptions(uniqueRegions);
      }
    } catch (error) {
      console.error('Error loading regions:', error);
    }
  };

  const columns = [
    {
      title: 'Learner Name',
      key: 'StudentName',
      dataIndex: 'StudentName',
      width: 160,
      render: (_e, item) => {
        return `${item.FirstName || ''} ${item.LastName || ''}`;
      },
    },
    {
      title: 'DOB',
      dataIndex: 'DateOfBirth',
      key: 'DateOfBirth',
      width: 120,
      ellipsis: true,
      render: (e) => e ? moment(e).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Gender',
      dataIndex: 'Gender',
      key: 'Gender',
      width: 85,
    },
    {
      title: 'Ethnicity',
      dataIndex: 'Ethnicity',
      key: 'Ethnicity',
      ellipsis: true,
      width: 100,
    },
    {
      title: 'Email',
      dataIndex: 'Email',
      key: 'Email',
      ellipsis: true,
      width: 120,
    },
    {
      title: 'School',
      dataIndex: 'School',
      key: 'School',
      ellipsis: true,
      width: 160,
    },
    {
      title: 'Teacher',
      dataIndex: 'Tutor',
      key: 'Tutor',
      ellipsis: true,
      width: 160,
    },
    {
      title: 'Fees',
      dataIndex: 'Fees',
      key: 'Fees',
      width: 90,
      ellipsis: true,
      render: (e) => <span style={{ fontSize: '12px' }}>{e}</span>,
    },
    {
      title: 'Region',
      dataIndex: 'Region',
      key: 'Region',
      ellipsis: true,
      width: 160,
    },
    {
      title: 'Status',
      dataIndex: 'Status',
      key: 'Status',
      ellipsis: true,
      width: 160,
    }
  ];

  const onChangeTable = (pagination) => {
    const { current, pageSize } = pagination;
    setPagination({ ...pagination, current, pageSize });
    getList({ current, pageSize });
  };

  const getList = (data = {}) => {
    setLoading(true);
    services.student
      .getReport({
        ...pagination,
        ...data,
        total: undefined
      })
      .then((res) => {
        console.log(res?.data?.[0]);
        setDataSum(res?.data?.[0] || []);
        setData(res?.data?.[1] || []);
        setPagination({ ...pagination, ...res?.pagination });
        calculate(res?.data?.[0]);
      })
      .catch((error) => {
        console.error('Error loading learner results:', error);
        Message.error('Failed to load report data. Please try again.');
        setDataSum([]);
        setData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getReportDataList = (data = {}) => {
    setLoading(true);
    services.student
      .getReport({
        ...pagination,
        ...data,
        total: undefined
      })
      .then((res) => {
        console.log(res?.data?.[0]);
        dynamicReportToExcel(columns, res?.data?.[1] || [], 'LearnerResults');
        Message.success('Excel file exported successfully!');
      })
      .catch((error) => {
        console.error('Error exporting report:', error);
        Message.error('Failed to export report. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };
  function calculate(data) {
    if (!data || data.length === 0) {
      setTotalPrecentage(0);
      return;
    }

    try {
      // Calculate totals
      var totalCourses = data.reduce((sum, item) => sum + (item.TotalCourse || 0), 0);
      // Total without "On Going"
      var totalWithoutOngoing = data.filter(item => item.CourseStatus !== "On Going").reduce((sum, item) => sum + (item.TotalCourse || 0), 0);
      // Get "Not Yet Achieved" count
      var notYetAchieved = data.find(item => item.CourseStatus === "Not Yet Achieved")?.TotalCourse || 0;
      // Calculate pass percentage from "Not Yet Achieved"
      // Assuming "passed" means courses that are completed successfully (Achieved + Excellence + Merit)
      var passedCourses = data.filter(item => ["Achieved", "Excellence", "Merit"].includes(item.CourseStatus))
        .reduce((sum, item) => sum + (item.TotalCourse || 0), 0);
      var passPercentage = notYetAchieved > 0 ? ((passedCourses / (passedCourses + notYetAchieved)) * 100).toFixed(1) : 0;
      setTotalPrecentage(passPercentage);
    } catch (error) {
      console.error('Error calculating statistics:', error);
      setTotalPrecentage(0);
    }
  }

  // Filter out undefined, null, and empty strings
  function filterEmpty(obj) {
    return Object.fromEntries(
      Object.entries(obj).filter(([key, value]) =>
        value !== undefined && value !== null && value !== ""
      )
    );
  }

  // Function to generate SQL WHERE clause from object
  function generateSQLWhere(obj) {
    // Filter out undefined values and build conditions
    const conditions = Object.entries(obj)
      .filter(([key, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => {
        // Replace underscores with dots for column names
        const columnName = key.replace(/_/g, '.');

        // Handle different value types
        if (Array.isArray(value)) {
          // Filter out empty values
          const filteredValue = value.filter(v => v !== undefined && v !== null && v !== '');
          if (filteredValue.length === 0) return null;

          // Check if this is a date range (both values are dates)
          const isDateRange = filteredValue.length === 2 &&
                              typeof filteredValue[0] === 'string' &&
                              typeof filteredValue[1] === 'string' &&
                              filteredValue[0].includes('-');

          if (isDateRange) {
            // Handle date range arrays
            return `${columnName} >= '${filteredValue[0]}' AND ${columnName} <= '${filteredValue[1]}'`;
          } else if (filteredValue.length === 1) {
            // Single value
            return `${columnName} = '${filteredValue[0]}'`;
          } else {
            // Multiple values, use IN clause
            const values = filteredValue.map(v => `'${String(v).replace(/'/g, "''")}'`).join(', ');
            return `${columnName} IN (${values})`;
          }
        } else if (typeof value === 'string') {
          // Escape single quotes in string values
          return `${columnName} = '${value.replace(/'/g, "''")}'`;
        } else if (typeof value === 'number') {
          return `${columnName} = ${value}`;
        } else if (value === null) {
          return `${columnName} IS NULL`;
        } else if (typeof value === 'boolean') {
          return `${columnName} = ${value ? 1 : 0}`;
        } else {
          // For other types, convert to string
          return `${columnName} = '${String(value).replace(/'/g, "''")}'`;
        }
      })
      .filter(condition => condition !== null); // Remove null conditions

    return conditions.length > 0 ? conditions.join(' AND ') : '';
  }


  const handleSubmit = () => {
    const values = form.getFieldsValue();
    console.log(values);
    var obj = filterEmpty(values);

    console.log(obj);
    var wherec = generateSQLWhere(obj);

    console.log(wherec);
    // setPagination({ ...pagination, current: 1 });
    // setFormParams(values);
    getList({
      current: 1,
      dyquery: wherec,
    });

  };
   const dynamicReportToExcel = async (c, d, t) => {
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
  };

  const exportOnClickExcel = () => {

    const values = form.getFieldsValue();
    console.log(values);
    var obj = filterEmpty(values);

    console.log(obj);
    var wherec = generateSQLWhere(obj);

    console.log(wherec);
    // setPagination({ ...pagination, current: 1 });
    // setFormParams(values);
    getReportDataList({
      current: 1,
      isReport: 1,
      dyquery: wherec,
    }); 
  };

  return (
    <div style={{ padding: 20 }}>
      <PageHeader title="Learner Results" />
      <Space style={{ marginBottom: 0, width: '100%' }}>
        <Card style={{ marginBottom: 20 }}>
          <Form form={form} layout="inline">
            <Form.Item label="Filter">
              <Select
                placeholder="Select"
                style={{ width: 200 }}
                mode="multiple"
                //renderFormat={() => null}
                value={selectedFilters}
                onChange={handleFilterChange}
                allowClear={true}
              >
                <Option value="date">Date</Option>
                <Option value="enrollmentType">Enrollment Type</Option>
                <Option value="ethnicity">Ethnicity</Option>
                <Option value="firstName">First Name</Option>
                <Option value="fees">Fees</Option>
                <Option value="lastName">Last Name</Option>
                <Option value="region">Region</Option>
                <Option value="school">School</Option>
                <Option value="tutor">Tutor</Option>
              </Select>
            </Form.Item>

            {selectedFilters.includes('firstName') && (
              <Form.Item
                label="First Name"
                field="S_FirstName"
              >
                <Input
                  allowClear
                  style={{ width: '100%' }}
                  placeholder="please enter"
                />
              </Form.Item>
            )}

            {selectedFilters.includes('lastName') && (
              <Form.Item
                label="Last Name"
                field="S_LastName"
              >
                <Input
                  allowClear
                  style={{ width: '100%' }}
                  placeholder="please enter"
                />
              </Form.Item>
            )}

            {selectedFilters.includes('enrollmentType') && (
              <Form.Item label="Enrollment Type" field="SIC_LearnerType">
                <Select defaultValue="all" style={{ width: 160 }}>
                  <Option value="1">Remote</Option>
                  <Option value="2">Workshop</Option>
                </Select>
              </Form.Item>
            )}

            {selectedFilters.includes('fees') && (
              <Form.Item label="Fees" field="S_Fees">
                <Select style={{ width: 160 }}>
                  <Option value="Paid">Paid</Option>
                  <Option value="Parially Paid">Parially Paid</Option>
                  <Option value="Un Paid">Un Paid</Option>
                </Select>
              </Form.Item>
            )}

            {selectedFilters.includes('date') && (
              <Form.Item label="Date" field="S_CreateDate">
                <DatePicker.RangePicker />
              </Form.Item>
            )}
            {selectedFilters.includes('school') && (
              <Form.Item
                label="School"
                field="S_School"
              >
                <Select
                  mode="multiple"
                  placeholder="Select schools"
                  style={{ width: 300 }}
                  showSearch
                  allowClear
                  filterOption={(inputValue, option) => {
                    return option.props.children?.toLowerCase().includes(inputValue.toLowerCase());
                  }}
                >
                  {schoolOptions.map((school) => (
                    <Option key={school.SchoolNumber} value={school.SchoolName}>
                      {school.SchoolName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}
            {selectedFilters.includes('ethnicity') && (
              <Form.Item
                label="Ethnicity"
                field="S_Ethnicity"
              >
                <Select
                  mode="multiple"
                  placeholder="Select ethnicity"
                  style={{ width: 300 }}
                  showSearch
                  allowClear
                  filterOption={(inputValue, option) => {
                    return option.props.children?.toLowerCase().includes(inputValue.toLowerCase());
                  }}
                >
                  {ethnicityOptions.map((ethnicity) => (
                    <Option key={ethnicity} value={ethnicity}>
                      {ethnicity}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}
            {selectedFilters.includes('region') && (
              <Form.Item
                label="Region"
                field="S_Region"
              >
                <Select
                  mode="multiple"
                  placeholder="Select regions"
                  style={{ width: 300 }}
                  showSearch
                  allowClear
                  filterOption={(inputValue, option) => {
                    return option.props.children?.toLowerCase().includes(inputValue.toLowerCase());
                  }}
                >
                  {regionOptions.map((region) => (
                    <Option key={region} value={region}>
                      {region}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}
            {selectedFilters.includes('tutor') && (
              <Form.Item
                label="Tutor"
                field="S_Tutor"
              >
                <Select
                  mode="multiple"
                  placeholder="Select tutors"
                  style={{ width: 300 }}
                  showSearch
                  allowClear
                  filterOption={(inputValue, option) => {
                    return option.props.children?.toLowerCase().includes(inputValue.toLowerCase());
                  }}
                >
                  {tutorOptions.map((tutor) => (
                    <Option key={tutor.TutorID} value={tutor.TutorName}>
                      {tutor.TutorName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}
            <Space>
              <Button type="primary" icon={<IconSearch />} onClick={handleSubmit}>
                {'Search'}
              </Button>        
              <Button
                onClick={() =>
                  exportOnClickExcel()
                }
                type="primary"
                style={{ marginLeft: 20 }}
              >
                {'Export Excel'}
              </Button>
            </Space>
          </Form>
        </Card>
      </Space>

      <Card style={{ marginBottom: 20 }}>
        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Progress type="circle" percent={totalPrecentage} width={80} />
            <Typography.Text>Passed {totalPrecentage}%</Typography.Text>
          </div>
          {dataSum.map((item, index) => (
            <Statistic
              key={item.CourseStatus}
              title={item.CourseStatus}
              value={item.TotalCourse}
            />
          ))}
        </Space>
      </Card>

      <ResizableTable
        key={columnsKey}
        columns={columns}
        rowKey={'ID'}
        data={data}
        loading={loading}
        scroll={{
          x: 1000,
        }}
        border={{
          wrapper: true,
          cell: true,
        }}
        pagination={{
          ...pagination,
          size: 'mini',
          bufferSize: 3,
          sizeCanChange: true,
          showTotal: true,
          showJumper: true,
          pageSizeChangeResetCurrent: true,
        }}
        onChange={onChangeTable}
      />
    </div>
  );
}