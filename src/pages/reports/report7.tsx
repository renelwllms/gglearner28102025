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
  // Student Information
  { key: 'StudentID', label: 'Student ID', dataType: 'number', category: 'Student' },
  { key: 'FirstName', label: 'First Name', dataType: 'string', category: 'Student' },
  { key: 'LastName', label: 'Last Name', dataType: 'string', category: 'Student' },
  { key: 'Email', label: 'Email', dataType: 'string', category: 'Student' },
  { key: 'PhoneNumber', label: 'Phone Number', dataType: 'string', category: 'Student' },
  { key: 'DateOfBirth', label: 'Date of Birth', dataType: 'date', category: 'Student' },
  { key: 'Gender', label: 'Gender', dataType: 'string', category: 'Student' },
  { key: 'Ethnicity', label: 'Ethnicity', dataType: 'string', category: 'Student' },
  { key: 'School', label: 'School', dataType: 'string', category: 'Student' },
  { key: 'SchoolNumber', label: 'School Number', dataType: 'string', category: 'Student' },
  { key: 'Tutor', label: 'Tutor', dataType: 'string', category: 'Student' },
  { key: 'Status', label: 'Status', dataType: 'string', category: 'Student' },
  { key: 'AssignedTo', label: 'Assigned To', dataType: 'string', category: 'Student' },
  { key: 'Fees', label: 'Fees', dataType: 'string', category: 'Student' },
  { key: 'Region', label: 'Region', dataType: 'string', category: 'Student' },
  { key: 'City', label: 'City', dataType: 'string', category: 'Student' },
  { key: 'StreetAddress', label: 'Street Address', dataType: 'string', category: 'Student' },
  { key: 'Zipcode', label: 'Zipcode', dataType: 'string', category: 'Student' },
  { key: 'CreateDate', label: 'Registration Date', dataType: 'date', category: 'Student' },
  { key: 'WorkbookOption', label: 'Workbook Option', dataType: 'string', category: 'Student' },
  { key: 'TeacherName', label: 'Teacher Name', dataType: 'string', category: 'Student' },
  { key: 'TeacherEmail', label: 'Teacher Email', dataType: 'string', category: 'Student' },
  { key: 'InvoiceEmail', label: 'Invoice Email', dataType: 'string', category: 'Student' },

  // Course Enrollment Information
  { key: 'CourseName', label: 'Course Name', dataType: 'string', category: 'Course' },
  { key: 'CourseLevel', label: 'Course Level', dataType: 'number', category: 'Course' },
  { key: 'CourseCredits', label: 'Course Credits', dataType: 'number', category: 'Course' },
  { key: 'CourseType', label: 'Course Type', dataType: 'string', category: 'Course' },
  { key: 'CourseStatus', label: 'Course Status', dataType: 'string', category: 'Course' },
  { key: 'EnrollmentDate', label: 'Enrollment Date', dataType: 'date', category: 'Course' },
  { key: 'LearnerType', label: 'Learner Type', dataType: 'number', category: 'Course' },
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

  // Course filter options
  const [filterCourseNames, setFilterCourseNames] = useState<string[]>([]);
  const [filterCourseTypes, setFilterCourseTypes] = useState<string[]>([]);
  const [filterCourseStatuses, setFilterCourseStatuses] = useState<string[]>([]);
  const [filterCourseLevels, setFilterCourseLevels] = useState<string[]>([]);

  // Dropdown options
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [tutorOptions, setTutorOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [ethnicityOptions] = useState([
    'NZ European', 'Maori', 'Cook Island Maori', 'Niuean', 'Samoan',
    'Tongan', 'Fijian', 'Tokelauan', 'Chinese', 'Indian', 'Japanese',
    'Korean', 'Vietnamese', 'Filipino', 'Malaysian', 'Indonesian', 'Thai',
    'Middle Eastern/Latin American/African', 'Other'
  ]);
  const [courseTypeOptions] = useState([
    'Work & Life Skills',
    'Farming & Horticulture',
    'Workshop'
  ]);
  const [courseStatusOptions] = useState([
    'Achieved',
    'In Progress',
    'Withdrawn',
    'Not Achieved',
    'Pending'
  ]);
  const [courseLevelOptions] = useState(['1', '2', '3', '4', '5', '6', '7']);

  // Load dropdown options on mount
  useEffect(() => {
    if (token) {
      loadSchools();
      loadTutors();
      loadRegions();
      loadCourses();
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
          const nameA = a.DeliverySpecialist?.toLowerCase() || '';
          const nameB = b.DeliverySpecialist?.toLowerCase() || '';
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

  const loadCourses = async () => {
    try {
      const res = await services.g.getCourseList();
      if (res.code === 0) {
        const sorted = (res.data || []).sort((a, b) => {
          const nameA = a.CourseName?.toLowerCase() || '';
          const nameB = b.CourseName?.toLowerCase() || '';
          return nameA.localeCompare(nameB);
        });
        setCourseOptions(sorted);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
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

    // Clear filter values when corresponding field is deselected
    if (!selectedFields.includes('School')) {
      setFilterSchools([]);
    }
    if (!selectedFields.includes('Tutor')) {
      setFilterTutors([]);
    }
    if (!selectedFields.includes('Region')) {
      setFilterRegions([]);
    }
    if (!selectedFields.includes('Ethnicity')) {
      setFilterEthnicities([]);
    }
    if (!selectedFields.includes('CourseName')) {
      setFilterCourseNames([]);
    }
    if (!selectedFields.includes('CourseType')) {
      setFilterCourseTypes([]);
    }
    if (!selectedFields.includes('CourseStatus')) {
      setFilterCourseStatuses([]);
    }
    if (!selectedFields.includes('CourseLevel')) {
      setFilterCourseLevels([]);
    }
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

    // Add course filter parameters
    if (filterCourseNames.length > 0) {
      params.courseNames = filterCourseNames.join(',');
    }
    if (filterCourseTypes.length > 0) {
      params.courseTypes = filterCourseTypes.join(',');
    }
    if (filterCourseStatuses.length > 0) {
      params.courseStatuses = filterCourseStatuses.join(',');
    }
    if (filterCourseLevels.length > 0) {
      params.courseLevels = filterCourseLevels.join(',');
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
    setData([]);
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

          {selectedFields.includes('School') && (
            <div>
              <Typography.Text style={{ marginRight: 8 }}>School:</Typography.Text>
              <Select
                mode="multiple"
                placeholder="Select schools"
                style={{ width: 300 }}
                size="small"
                allowClear
                showSearch
                maxTagCount={2}
                value={filterSchools}
                onChange={(value) => setFilterSchools(value)}
                filterOption={(inputValue, option) => {
                  return option.props.children?.toLowerCase().includes(inputValue.toLowerCase());
                }}
              >
                {schoolOptions
                  .filter(school => !filterSchools.includes(school.SchoolName))
                  .map((school) => (
                    <Option key={school.SchoolNumber} value={school.SchoolName}>
                      {school.SchoolName}
                    </Option>
                  ))}
              </Select>
            </div>
          )}

          {selectedFields.includes('Tutor') && (
            <div>
              <Typography.Text style={{ marginRight: 8 }}>Tutor:</Typography.Text>
              <Select
                mode="multiple"
                placeholder="Select tutors"
                style={{ width: 300 }}
                size="small"
                allowClear
                showSearch
                maxTagCount={2}
                value={filterTutors}
                onChange={(value) => setFilterTutors(value)}
                filterOption={(inputValue, option) => {
                  return option.props.children?.toLowerCase().includes(inputValue.toLowerCase());
                }}
              >
                {tutorOptions
                  .filter(tutor => !filterTutors.includes(tutor.DeliverySpecialist))
                  .map((tutor) => (
                    <Option key={tutor.Id} value={tutor.DeliverySpecialist}>
                      {tutor.DeliverySpecialist}
                    </Option>
                  ))}
              </Select>
            </div>
          )}

          {selectedFields.includes('Region') && (
            <div>
              <Typography.Text style={{ marginRight: 8 }}>Region:</Typography.Text>
              <Select
                mode="multiple"
                placeholder="Select regions"
                style={{ width: 300 }}
                size="small"
                allowClear
                showSearch
                maxTagCount={2}
                value={filterRegions}
                onChange={(value) => setFilterRegions(value)}
                filterOption={(inputValue, option) => {
                  return option.props.children?.toLowerCase().includes(inputValue.toLowerCase());
                }}
              >
                {regionOptions
                  .filter(region => !filterRegions.includes(region))
                  .map((region) => (
                    <Option key={region} value={region}>
                      {region}
                    </Option>
                  ))}
              </Select>
            </div>
          )}

          {selectedFields.includes('Ethnicity') && (
            <div>
              <Typography.Text style={{ marginRight: 8 }}>Ethnicity:</Typography.Text>
              <Select
                mode="multiple"
                placeholder="Select ethnicities"
                style={{ width: 300 }}
                size="small"
                allowClear
                showSearch
                maxTagCount={2}
                value={filterEthnicities}
                onChange={(value) => setFilterEthnicities(value)}
                filterOption={(inputValue, option) => {
                  return option.props.children?.toLowerCase().includes(inputValue.toLowerCase());
                }}
              >
                {ethnicityOptions
                  .filter(ethnicity => !filterEthnicities.includes(ethnicity))
                  .map((ethnicity) => (
                    <Option key={ethnicity} value={ethnicity}>
                      {ethnicity}
                    </Option>
                  ))}
              </Select>
            </div>
          )}

          {selectedFields.includes('CourseName') && (
            <div>
              <Typography.Text style={{ marginRight: 8 }}>Course Name:</Typography.Text>
              <Select
                mode="multiple"
                placeholder="Select courses"
                style={{ width: 300 }}
                size="small"
                allowClear
                showSearch
                maxTagCount={2}
                value={filterCourseNames}
                onChange={(value) => setFilterCourseNames(value)}
                filterOption={(inputValue, option) => {
                  return option.props.children?.toLowerCase().includes(inputValue.toLowerCase());
                }}
              >
                {courseOptions
                  .filter(course => !filterCourseNames.includes(course.CourseName))
                  .map((course) => (
                    <Option key={course.CourseID} value={course.CourseName}>
                      {course.CourseName}
                    </Option>
                  ))}
              </Select>
            </div>
          )}

          {selectedFields.includes('CourseType') && (
            <div>
              <Typography.Text style={{ marginRight: 8 }}>Course Type:</Typography.Text>
              <Select
                mode="multiple"
                placeholder="Select course types"
                style={{ width: 250 }}
                size="small"
                allowClear
                maxTagCount={2}
                value={filterCourseTypes}
                onChange={(value) => setFilterCourseTypes(value)}
              >
                {courseTypeOptions
                  .filter(courseType => !filterCourseTypes.includes(courseType))
                  .map((courseType) => (
                    <Option key={courseType} value={courseType}>
                      {courseType}
                    </Option>
                  ))}
              </Select>
            </div>
          )}

          {selectedFields.includes('CourseStatus') && (
            <div>
              <Typography.Text style={{ marginRight: 8 }}>Course Status:</Typography.Text>
              <Select
                mode="multiple"
                placeholder="Select course statuses"
                style={{ width: 250 }}
                size="small"
                allowClear
                maxTagCount={2}
                value={filterCourseStatuses}
                onChange={(value) => setFilterCourseStatuses(value)}
              >
                {courseStatusOptions
                  .filter(courseStatus => !filterCourseStatuses.includes(courseStatus))
                  .map((courseStatus) => (
                    <Option key={courseStatus} value={courseStatus}>
                      {courseStatus}
                    </Option>
                  ))}
              </Select>
            </div>
          )}

          {selectedFields.includes('CourseLevel') && (
            <div>
              <Typography.Text style={{ marginRight: 8 }}>Course Level:</Typography.Text>
              <Select
                mode="multiple"
                placeholder="Select course levels"
                style={{ width: 200 }}
                size="small"
                allowClear
                maxTagCount={3}
                value={filterCourseLevels}
                onChange={(value) => setFilterCourseLevels(value)}
              >
                {courseLevelOptions
                  .filter(courseLevel => !filterCourseLevels.includes(courseLevel))
                  .map((courseLevel) => (
                    <Option key={courseLevel} value={courseLevel}>
                      Level {courseLevel}
                    </Option>
                  ))}
              </Select>
            </div>
          )}
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
