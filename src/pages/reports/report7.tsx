import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Card, Button, Table, Message, Select, Checkbox, Space, Typography } from '@arco-design/web-react';
import * as services from '@/services';
import { useSelector } from 'react-redux';
import styles from './index.module.less';
import Row from '@arco-design/web-react/es/Grid/row';
import { DatePicker } from '@arco-design/web-react';
import { exportExcel } from './excelExport';
const { RangePicker } = DatePicker;
const { Option } = Select;

// Available fields that can be selected for the report
const AVAILABLE_FIELDS = [
  { key: 'StudentID', label: 'Student ID', dataType: 'number' },
  { key: 'FirstName', label: 'First Name', dataType: 'string' },
  { key: 'LastName', label: 'Last Name', dataType: 'string' },
  { key: 'Email', label: 'Email', dataType: 'string' },
  { key: 'PhoneNumber', label: 'Phone Number', dataType: 'string' },
  { key: 'DateOfBirth', label: 'Date of Birth', dataType: 'date' },
  { key: 'Gender', label: 'Gender', dataType: 'string' },
  { key: 'Ethnicity', label: 'Ethnicity', dataType: 'string' },
  { key: 'School', label: 'School', dataType: 'string' },
  { key: 'SchoolNumber', label: 'School Number', dataType: 'string' },
  { key: 'Tutor', label: 'Tutor', dataType: 'string' },
  { key: 'Status', label: 'Status', dataType: 'string' },
  { key: 'AssignedTo', label: 'Assigned To', dataType: 'string' },
  { key: 'Fees', label: 'Fees', dataType: 'string' },
  { key: 'Region', label: 'Region', dataType: 'string' },
  { key: 'City', label: 'City', dataType: 'string' },
  { key: 'StreetAddress', label: 'Street Address', dataType: 'string' },
  { key: 'Zipcode', label: 'Zipcode', dataType: 'string' },
  { key: 'CreateDate', label: 'Registration Date', dataType: 'date' },
  { key: 'WorkbookOption', label: 'Workbook Option', dataType: 'string' },
  { key: 'TeacherName', label: 'Teacher Name', dataType: 'string' },
  { key: 'TeacherEmail', label: 'Teacher Email', dataType: 'string' },
  { key: 'InvoiceEmail', label: 'Invoice Email', dataType: 'string' },
];

function Report7() {
  const token = useSelector((state: any) => state.token);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'FirstName',
    'LastName',
    'Email',
    'School',
    'Status',
    'CreateDate'
  ]);
  const [time, setTime] = useState([
    String(moment().year()),
    String(moment().year()),
  ]);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [filterAssignedTo, setFilterAssignedTo] = useState<string | undefined>(undefined);

  // Additional filter options
  const [filterSchools, setFilterSchools] = useState<string[]>([]);
  const [filterTutors, setFilterTutors] = useState<string[]>([]);
  const [filterRegions, setFilterRegions] = useState<string[]>([]);
  const [filterEthnicities, setFilterEthnicities] = useState<string[]>([]);

  // Dropdown options
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [tutorOptions, setTutorOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [ethnicityOptions] = useState([
    'NZ European', 'Maori', 'Cook Island Maori', 'Niuean', 'Samoan',
    'Tongan', 'Fijian', 'Tokelauan', 'Chinese', 'Indian', 'Japanese',
    'Korean', 'Vietnamese', 'Filipino', 'Malaysian', 'Indonesian', 'Thai',
    'Middle Eastern/Latin American/African', 'Other'
  ]);

  // Load dropdown options on mount
  useEffect(() => {
    if (token) {
      loadSchools();
      loadTutors();
      loadRegions();
    }
  }, [token]);

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

  useEffect(() => {
    // Build columns based on selected fields
    const tableColumns = selectedFields.map((fieldKey) => {
      const field = AVAILABLE_FIELDS.find(f => f.key === fieldKey);
      if (!field) return null;

      return {
        title: field.label,
        dataIndex: field.key,
        key: field.key,
        width: 150,
        ellipsis: true,
        render: (value) => {
          if (!value) return '-';

          // Format based on data type
          if (field.dataType === 'date') {
            return moment(value).format('DD/MM/YYYY');
          }
          return value;
        },
      };
    }).filter(Boolean);

    setColumns(tableColumns);
  }, [selectedFields]);

  const getList = () => {
    if (selectedFields.length === 0) {
      Message.warning('Please select at least one field to display');
      return;
    }

    const params: any = {
      fields: selectedFields.join(','),
      startYear: time?.length > 0 ? time[0] : undefined,
      endYear: time?.length > 0 ? time[1] : undefined,
      status: filterStatus,
      assignedTo: filterAssignedTo,
    };

    // Add multi-select filters if values are selected
    if (filterSchools.length > 0) {
      params.schools = filterSchools.join(',');
    }
    if (filterTutors.length > 0) {
      params.tutors = filterTutors.join(',');
    }
    if (filterRegions.length > 0) {
      params.regions = filterRegions.join(',');
    }
    if (filterEthnicities.length > 0) {
      params.ethnicities = filterEthnicities.join(',');
    }

    console.log('Starting Report 7 API call with params:', params);

    setLoading(true);
    services.g
      .getReport7(params)
      .then((res) => {
        console.log('Report 7 API response:', res);
        const records = res?.data || [];
        setData(records);
        Message.success(`Loaded ${records.length} records`);
        console.log('Data set to:', records);
      })
      .catch((error) => {
        console.error('Error loading report 7:', error);
        console.error('Error details:', error.response || error.message);
        Message.error(`Failed to load custom report: ${error.message || 'Unknown error'}`);
        setData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Don't auto-load on mount - user should click "Generate Report"
  // useEffect(() => {
  //   if (token && selectedFields.length > 0) {
  //     getList();
  //   }
  // }, [token]);

  const handleExport = async () => {
    if (data.length === 0) {
      Message.warning('No data to export. Please run the report first.');
      return;
    }

    try {
      await exportExcel(columns, data, 'CUSTOM REPORT');
      Message.success('Excel file exported successfully!');
    } catch (error) {
      console.error('Error exporting report:', error);
      Message.error('Failed to export Excel file. Please try again.');
    }
  };

  const handleFieldToggle = (fieldKey: string) => {
    setSelectedFields(prev => {
      if (prev.includes(fieldKey)) {
        return prev.filter(key => key !== fieldKey);
      } else {
        return [...prev, fieldKey];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedFields(AVAILABLE_FIELDS.map(f => f.key));
  };

  const handleClearAll = () => {
    setSelectedFields([]);
  };

  return (
    <Card className={styles['reports-result']}>
      <div style={{ marginBottom: 20, padding: '16px', background: '#f7f8fa', borderRadius: '4px' }}>
        <Typography.Title heading={6} style={{ marginBottom: 12 }}>
          Select Fields to Include in Report
        </Typography.Title>

        <Space style={{ marginBottom: 12 }}>
          <Button size="small" onClick={handleSelectAll}>
            Select All
          </Button>
          <Button size="small" onClick={handleClearAll}>
            Clear All
          </Button>
          <Typography.Text type="secondary" style={{ marginLeft: 8 }}>
            ({selectedFields.length} fields selected)
          </Typography.Text>
        </Space>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '8px',
          marginBottom: 16
        }}>
          {AVAILABLE_FIELDS.map(field => (
            <Checkbox
              key={field.key}
              checked={selectedFields.includes(field.key)}
              onChange={() => handleFieldToggle(field.key)}
            >
              {field.label}
            </Checkbox>
          ))}
        </div>

        <Typography.Title heading={6} style={{ marginTop: 20, marginBottom: 12 }}>
          Filter Options
        </Typography.Title>

        <Space wrap>
          <div>
            <Typography.Text style={{ marginRight: 8 }}>Date Range:</Typography.Text>
            <RangePicker
              value={time}
              mode="year"
              style={{ width: 200 }}
              onChange={(d) => {
                setTime(d);
              }}
              size="small"
            />
          </div>

          <div>
            <Typography.Text style={{ marginRight: 8 }}>Status:</Typography.Text>
            <Select
              placeholder="All Statuses"
              style={{ width: 160 }}
              size="small"
              allowClear
              value={filterStatus}
              onChange={(value) => setFilterStatus(value)}
            >
              <Option value="On Going">On Going</Option>
              <Option value="Completed">Completed</Option>
              <Option value="Withdrawn">Withdrawn</Option>
              <Option value="Did Not Complete">Did Not Complete</Option>
              <Option value="Other">Other</Option>
            </Select>
          </div>

          <div>
            <Typography.Text style={{ marginRight: 8 }}>Assigned To:</Typography.Text>
            <Select
              placeholder="All"
              style={{ width: 160 }}
              size="small"
              allowClear
              value={filterAssignedTo}
              onChange={(value) => setFilterAssignedTo(value)}
            >
              <Option value="School">School</Option>
              <Option value="GET Group">GET Group</Option>
            </Select>
          </div>

          <div>
            <Typography.Text style={{ marginRight: 8 }}>School:</Typography.Text>
            <Select
              mode="multiple"
              placeholder="Select schools"
              style={{ width: 300 }}
              size="small"
              allowClear
              showSearch
              value={filterSchools}
              onChange={(value) => setFilterSchools(value)}
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
          </div>

          <div>
            <Typography.Text style={{ marginRight: 8 }}>Tutor:</Typography.Text>
            <Select
              mode="multiple"
              placeholder="Select tutors"
              style={{ width: 300 }}
              size="small"
              allowClear
              showSearch
              value={filterTutors}
              onChange={(value) => setFilterTutors(value)}
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
          </div>

          <div>
            <Typography.Text style={{ marginRight: 8 }}>Region:</Typography.Text>
            <Select
              mode="multiple"
              placeholder="Select regions"
              style={{ width: 300 }}
              size="small"
              allowClear
              showSearch
              value={filterRegions}
              onChange={(value) => setFilterRegions(value)}
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
          </div>

          <div>
            <Typography.Text style={{ marginRight: 8 }}>Ethnicity:</Typography.Text>
            <Select
              mode="multiple"
              placeholder="Select ethnicities"
              style={{ width: 300 }}
              size="small"
              allowClear
              showSearch
              value={filterEthnicities}
              onChange={(value) => setFilterEthnicities(value)}
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
          </div>
        </Space>
      </div>

      <Row style={{ marginBottom: 16 }}>
        <Space>
          <Button
            onClick={() => getList()}
            type="primary"
            size="mini"
            disabled={selectedFields.length === 0}
          >
            Generate Report
          </Button>
          <Button
            size="mini"
            onClick={handleExport}
            type="primary"
            disabled={data.length === 0}
          >
            Export Excel
          </Button>
          <Typography.Text type="secondary">
            {data.length} record(s) found
          </Typography.Text>
        </Space>
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
          x: selectedFields.length * 150,
          y: 600,
        }}
        pagination={{
          pageSize: 50,
          showTotal: true,
          showJumper: true,
          sizeCanChange: true,
        }}
      />
    </Card>
  );
}

export default Report7;
