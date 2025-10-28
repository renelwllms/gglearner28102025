import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Notification,
  Steps,
  Card,
  Typography,
  Message,
  Table,
  Modal,
  Alert,
  Badge,
  Grid,
} from '@arco-design/web-react';
import { IconCheckCircle, IconInfoCircle } from '@arco-design/web-react/icon';
import * as services from '@/services';
import styles from './index.module.less';

const Step = Steps.Step;
const { Row, Col } = Grid;

interface FormWizardProps {
  handleSubmit: (values: any) => void;
  loading: boolean;
  form: any;
  handleCancel?: (() => void) | null;
}

function FormWizard({ handleSubmit, loading, form, handleCancel = null }: FormWizardProps) {
  const [current, setCurrent] = useState(0);
  const [schoolOption, setSchoolOption] = useState([]);
  const [workshopOptions, setWorkshopOptions] = useState([]);
  const [existingStudents, setExistingStudents] = useState([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [showCodeField, setShowCodeField] = useState(false);

  useEffect(() => {
    console.log('FormWizard mounted - loading schools and workshops');
    getOptions();
    getWorkshops();

    // Initialize showCodeField based on existing form value
    const learnerType = form.getFieldValue('LearnerType');
    if (learnerType === 'Workshop') {
      setShowCodeField(true);
    }
  }, []);

  const getOptions = async () => {
    try {
      const res = await services.g.getSchool({});
      // Sort schools alphabetically by SchoolName
      const sortedSchools = (res?.data || []).sort((a, b) => {
        const nameA = a.SchoolName?.toLowerCase() || '';
        const nameB = b.SchoolName?.toLowerCase() || '';
        return nameA.localeCompare(nameB);
      });
      setSchoolOption(sortedSchools);
    } catch (error) {
      console.error('Failed to load schools:', error);
      Notification.error({
        title: 'Error',
        content: 'Failed to load school list. Please refresh the page.',
        duration: 5000,
      });
    }
  };

  const getWorkshops = async () => {
    try {
      console.log('Loading workshops...');
      const res = await services.g.getWorkshop({});
      console.log('Workshops loaded:', res?.data?.length);
      setWorkshopOptions(res?.data || []);
    } catch (error) {
      console.error('Failed to load workshops:', error);
    }
  };

  const handleWorkshopChange = async (code: string) => {
    console.log('Workshop changed, code:', code);
    if (!code) {
      console.log('No code provided, skipping auto-population');
      return;
    }
    try {
      console.log('Fetching workshop info for code:', code);
      const res = await services.g.getWorkshopInforByCode({ Code: code });
      console.log('Workshop API response:', res);
      const workshopData = res?.data?.[0];
      console.log('Workshop data:', workshopData);
      if (workshopData && workshopData.SchoolNumber && workshopData.SchoolName) {
        console.log('Setting school field to:', { label: workshopData.SchoolName, value: workshopData.SchoolNumber });
        // Auto-populate school name from workshop
        form.setFieldValue('SchoolName', {
          label: workshopData.SchoolName,
          value: workshopData.SchoolNumber,
        });
        Notification.success({
          title: 'School Auto-Populated',
          content: `School set to: ${workshopData.SchoolName}`,
          duration: 3000,
        });
      } else {
        console.log('Workshop data missing school info');
      }
    } catch (error) {
      console.error('Failed to fetch workshop info:', error);
    }
  };

  const checkForDuplicates = async () => {
    const values = form.getFieldsValue();
    const { FirstName, LastName, DOB, SchoolName } = values;

    if (!FirstName || !LastName) {
      return [];
    }

    try {
      // Search for potential duplicates using the existing student list API
      const res = await services.student.getStudentList({
        name: `${FirstName} ${LastName}`,
        pageSize: 50,
        current: 1,
      });

      if (res?.data && res.data.length > 0) {
        // Filter for exact matches on FirstName, LastName, DOB, and School
        const matches = res.data.filter((student) => {
          const firstNameMatch = student.FirstName?.toLowerCase() === FirstName?.toLowerCase();
          const lastNameMatch = student.LastName?.toLowerCase() === LastName?.toLowerCase();

          // Check DOB match if provided
          let dobMatch = true;
          if (DOB) {
            const studentDOB = student.DateOfBirth || student.DOB;
            if (studentDOB) {
              // Format both dates to DD/MM/YYYY for comparison
              const formDOBStr = DOB.format ? DOB.format('DD/MM/YYYY') : DOB;
              const studentDOBStr = typeof studentDOB === 'string'
                ? studentDOB.split('T')[0] // Handle ISO format
                : studentDOB;

              dobMatch = formDOBStr === studentDOBStr ||
                         formDOBStr.split('/').reverse().join('-') === studentDOBStr ||
                         formDOBStr === studentDOBStr.split('T')[0];
            }
          }

          // Check School match if provided
          let schoolMatch = true;
          if (SchoolName?.label) {
            const studentSchool = (student.School || student.SchoolName || '').toLowerCase();
            const formSchool = SchoolName.label.toLowerCase();
            schoolMatch = studentSchool === formSchool || studentSchool.includes(formSchool) || formSchool.includes(studentSchool);
          }

          // Return only students that match ALL criteria
          return firstNameMatch && lastNameMatch && dobMatch && schoolMatch;
        });

        console.log(`Found ${matches.length} duplicate matches for ${FirstName} ${LastName}`);
        return matches;
      }

      return [];
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return [];
    }
  };

  const handleNext = async () => {
    if (current === 0) {
      // Validate step 1 fields only
      const fieldsToValidate = ['FirstName', 'LastName', 'Email', 'DOB', 'Gender', 'Ethnicity', 'LearnerType'];

      // Add Code validation if Workshop learner
      if (showCodeField) {
        fieldsToValidate.push('Code');
      }

      try {
        // Validate only Step 1 fields - will throw if validation fails
        await form.validate(fieldsToValidate);

        // If validation passes, check for duplicates
        const duplicates = await checkForDuplicates();
        if (duplicates.length > 0) {
          setExistingStudents(duplicates);
          setShowDuplicateWarning(true);
        } else {
          setCurrent(1);
        }
      } catch (error) {
        // Validation failed - form will show field-specific errors
        console.log('Step 1 validation errors:', error);
      }
    } else if (current === 1) {
      // Validate step 2 field only
      try {
        await form.validate(['SchoolName']);
        setCurrent(2);
      } catch (error) {
        // Validation failed - form will show field-specific errors
        console.log('Step 2 validation errors:', error);
      }
    }
  };

  const handlePrev = () => {
    setCurrent(current - 1);
  };

  const handleFinalSubmit = async () => {
    try {
      // Get all current form values
      const values = form.getFieldsValue();

      console.log('Form values on submit:', values);
      console.log('showCodeField state:', showCodeField);

      // Manual validation checks
      if (!values.LearnerType) {
        console.log('Validation failed: LearnerType is missing or empty');
        Message.error('Please select learner type');
        return;
      }

      if (showCodeField && !values.Code) {
        Message.error('Please enter workshop code');
        return;
      }

      if (!values.FirstName || !values.LastName) {
        Message.error('Please enter first and last name');
        return;
      }

      if (!values.Email) {
        Message.error('Please enter email address');
        return;
      }

      if (!values.DOB) {
        Message.error('Please select date of birth');
        return;
      }

      if (!values.Gender) {
        Message.error('Please select gender');
        return;
      }

      if (!values.Ethnicity) {
        Message.error('Please select ethnicity');
        return;
      }

      if (!values.SchoolName || !values.SchoolName.label) {
        Message.error('Please select a school');
        return;
      }

      // Ensure Code is empty string for Remote learners
      if (!showCodeField) {
        values.Code = '';
      }

      // All validation passed, submit the form
      handleSubmit(values);
    } catch (error) {
      console.log('Final submit error:', error);
      Message.error('An error occurred. Please try again.');
    }
  };

  const handleReset = () => {
    form.resetFields();
    setCurrent(0);
    setExistingStudents([]);
    setShowDuplicateWarning(false);
  };

  const handleSelectExistingStudent = (student: any) => {
    console.log('Selected existing student:', student);
    // Populate the form with the existing student's data
    form.setFieldsValue({
      FirstName: student.FirstName,
      LastName: student.LastName,
      Email: student.Email,
      DOB: student.DateOfBirth || student.DOB,
      Gender: student.Gender,
      Ethnicity: student.Ethnicity,
      SchoolName: {
        label: student.School || student.SchoolName,
        value: student.SchoolNumber,
      },
      LearnerType: student.Code ? 'Workshop' : 'Remote',
      Code: student.Code || '',
    });

    // Close the duplicate warning modal
    setShowDuplicateWarning(false);

    // Show success notification
    Notification.success({
      title: 'Student Record Selected',
      content: `Loaded existing record for ${student.FirstName} ${student.LastName}. Please review and continue.`,
      duration: 3000,
    });

    // Move to next step (School Info)
    setCurrent(1);
  };

  const duplicateColumns = [
    {
      title: 'Name',
      dataIndex: 'FirstName',
      render: (_: any, record: any) => `${record.FirstName} ${record.LastName}`,
    },
    {
      title: 'Email',
      dataIndex: 'Email',
    },
    {
      title: 'School',
      dataIndex: 'School',
      render: (_: any, record: any) => record.School || record.SchoolName || '-',
    },
    {
      title: 'Status',
      dataIndex: 'Status',
    },
    {
      title: 'Action',
      render: (_: any, record: any) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleSelectExistingStudent(record)}
        >
          Select This Student
        </Button>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Steps current={current} style={{ marginBottom: 16 }} size="small">
          <Step title="Personal Info" />
          <Step title="School Info" />
          <Step title="Review" />
        </Steps>
      </div>

      <Form
        form={form}
        className={styles['search-form']}
        labelAlign="left"
        wrapperCol={{ span: 24 }}
        layout="vertical"
        autoComplete="off"
      >
        {/* Step 1: Personal Information */}
        <div style={{ display: current === 0 ? 'block' : 'none' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Learner Type"
                  field="LearnerType"
                  rules={[{ required: true, message: 'Please select learner type' }]}
                >
                  <Select
                    placeholder="Select learner type"
                    options={[
                      { label: 'Remote Learner', value: 'Remote' },
                      { label: 'Workshop Learner', value: 'Workshop' },
                    ]}
                    onChange={(value) => {
                      setShowCodeField(value === 'Workshop');
                      if (value === 'Remote') {
                        form.setFieldValue('Code', '');
                      }
                    }}
                  />
                </Form.Item>
              </Col>

              {showCodeField && (
                <Col span={12}>
                  <Form.Item
                    label="Workshop Code"
                    field="Code"
                    tooltip="Select a workshop to auto-populate the school name"
                    rules={[
                      {
                        required: showCodeField,
                        message: 'Please select workshop code'
                      }
                    ]}
                  >
                    <Select
                      showSearch
                      allowClear
                      onChange={handleWorkshopChange}
                      placeholder="Select workshop"
                      filterOption={(inputValue, option) => {
                        const code = option.props.value || '';
                        const courseName = option.props.children || '';
                        return (
                          code.toLowerCase().includes(inputValue.toLowerCase()) ||
                          courseName.toString().toLowerCase().includes(inputValue.toLowerCase())
                        );
                      }}
                    >
                      {workshopOptions.map((workshop) => (
                        <Select.Option key={workshop.Code} value={workshop.Code}>
                          {workshop.Code} - {workshop.CourseName} ({workshop.SchoolName})
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              )}
            </Row>

            <Alert
              type="info"
              content={
                showCodeField
                  ? 'Workshop learners are associated with a specific workshop code'
                  : 'Remote learners work independently without a workshop code'
              }
              closable
              style={{ marginBottom: 12 }}
            />

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="First Name"
                  field="FirstName"
                  rules={[{ required: true, message: 'Please enter first name' }]}
                >
                  <Input allowClear placeholder="Enter first name" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Last Name"
                  field="LastName"
                  rules={[{ required: true, message: 'Please enter last name' }]}
                >
                  <Input allowClear placeholder="Enter last name" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Email"
                  field="Email"
                  rules={[
                    { required: true, message: 'Please enter email address' },
                    { type: 'email', message: 'Please enter a valid email address' },
                  ]}
                >
                  <Input allowClear type="email" placeholder="Enter email address" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label="Date of Birth"
                  field="DOB"
                  rules={[{ required: true, message: 'Please select date of birth' }]}
                >
                  <DatePicker
                    format={(value) => `${value.format('DD/MM/YYYY')}`}
                    style={{ width: '100%' }}
                    placeholder="Select date of birth"
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label="Gender"
                  field="Gender"
                  rules={[{ required: true, message: 'Please select gender' }]}
                >
                  <Select allowClear options={['Male', 'Female', 'Other']} placeholder="Select gender" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label="Ethnicity"
                  field="Ethnicity"
                  rules={[{ required: true, message: 'Please select ethnicity' }]}
                >
                  <Select
                    allowClear
                    allowCreate
                    showSearch
                    options={[
                      'Australian',
                      'British',
                      'Cambodian',
                      'Chinese',
                      'Cook Island',
                      'Dutch',
                      'Fijian',
                      'German',
                      'Indian',
                      'Italian',
                      'Japanese',
                      'Korean',
                      'American',
                      'NZ European',
                      'Maori',
                      'Polish',
                      'Samoan',
                      'Tongan',
                    ]}
                    placeholder="Select ethnicity"
                  />
                </Form.Item>
              </Col>
            </Row>
        </div>

        {/* Step 2: School Information */}
        <div style={{ display: current === 1 ? 'block' : 'none' }}>
            <Form.Item
              label="School Name"
              field="SchoolName"
              rules={[{ required: true, message: 'Please select school' }]}
            >
              <Select
                labelInValue
                showSearch
                allowClear
                options={schoolOption.map((it) => ({
                  label: it.SchoolName,
                  value: it.SchoolNumber,
                }))}
                allowCreate={{
                  formatter: (inputValue) => {
                    return {
                      value: inputValue,
                      label: `Custom: ${inputValue}`,
                    };
                  },
                }}
                filterOption={(inputValue, option) => {
                  try {
                    return (
                      option?.props.value?.label
                        ?.toLowerCase()
                        ?.indexOf(inputValue?.toLowerCase()) >= 0 ||
                      option?.props?.children
                        ?.toLowerCase()
                        ?.indexOf(inputValue?.toLowerCase()) >= 0
                    );
                  } catch (error) {
                    console.error('Filter option error:', error);
                    return false;
                  }
                }}
                placeholder="Select school (or enter manually)"
              />
            </Form.Item>

            <Alert
              type="info"
              icon={<IconInfoCircle />}
              content="Schools are sorted alphabetically for easy selection"
              closable
              style={{ marginTop: 8 }}
            />
        </div>

        {/* Step 3: Review & Submit */}
        <div style={{ display: current === 2 ? 'block' : 'none' }}>
            <Typography.Title heading={6} style={{ marginBottom: 16, marginTop: 0 }}>
              Please review the information before submitting
            </Typography.Title>

            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <Typography.Text bold style={{ fontSize: '14px' }}>Learner Type</Typography.Text>
                  <div style={{ marginTop: 8, padding: '8px 12px', background: '#f7f8fa', borderRadius: '4px' }}>
                    <p style={{ margin: '4px 0', fontSize: '13px' }}>
                      <Badge
                        status={form.getFieldValue('LearnerType') === 'Workshop' ? 'processing' : 'success'}
                        text={form.getFieldValue('LearnerType') === 'Workshop' ? 'Workshop Learner' : 'Remote Learner'}
                      />
                    </p>
                    {form.getFieldValue('Code') && (
                      <p style={{ margin: '4px 0', fontSize: '13px' }}>
                        <strong>Code:</strong> {form.getFieldValue('Code')}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <Typography.Text bold style={{ fontSize: '14px' }}>Personal Information</Typography.Text>
                  <div style={{ marginTop: 8, padding: '8px 12px', background: '#f7f8fa', borderRadius: '4px' }}>
                    <p style={{ margin: '4px 0', fontSize: '13px' }}>
                      <strong>Name:</strong> {form.getFieldValue('FirstName')} {form.getFieldValue('LastName')}
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '13px' }}>
                      <strong>Email:</strong> {form.getFieldValue('Email')}
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '13px' }}>
                      <strong>DOB:</strong> {form.getFieldValue('DOB')?.format ? form.getFieldValue('DOB').format('DD/MM/YYYY') : form.getFieldValue('DOB')}
                    </p>
                  </div>
                </div>
              </Col>

              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <Typography.Text bold style={{ fontSize: '14px' }}>Additional Details</Typography.Text>
                  <div style={{ marginTop: 8, padding: '8px 12px', background: '#f7f8fa', borderRadius: '4px' }}>
                    <p style={{ margin: '4px 0', fontSize: '13px' }}>
                      <strong>Gender:</strong> {form.getFieldValue('Gender')}
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '13px' }}>
                      <strong>Ethnicity:</strong> {form.getFieldValue('Ethnicity')}
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <Typography.Text bold style={{ fontSize: '14px' }}>School Information</Typography.Text>
                  <div style={{ marginTop: 8, padding: '8px 12px', background: '#f7f8fa', borderRadius: '4px' }}>
                    <p style={{ margin: '4px 0', fontSize: '13px' }}>
                      <strong>School:</strong> {form.getFieldValue('SchoolName')?.label}
                    </p>
                  </div>
                </div>
              </Col>
            </Row>

            <Alert
              type="success"
              icon={<IconCheckCircle />}
              content="All required information has been provided. Click Submit to add the student."
              style={{ marginTop: 8 }}
            />
        </div>

        {/* Navigation Buttons */}
        <Form.Item style={{ textAlign: 'center', marginTop: 24, marginBottom: 0 }}>
          <Space size="large">
            {current > 0 && (
              <Button onClick={handlePrev} disabled={loading}>
                Previous
              </Button>
            )}

            {current < 2 && (
              <Button type="primary" onClick={handleNext}>
                Next
              </Button>
            )}

            {current === 2 && (
              <Button type="primary" loading={loading} onClick={handleFinalSubmit}>
                Submit
              </Button>
            )}

            {handleCancel ? (
              <Button onClick={handleCancel} disabled={loading}>
                Cancel
              </Button>
            ) : (
              <Button onClick={handleReset} disabled={loading}>
                Reset
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>

      {/* Duplicate Warning Modal */}
      <Modal
        title="Potential Duplicate Students Found"
        visible={showDuplicateWarning}
        onCancel={() => setShowDuplicateWarning(false)}
        footer={
          <Space>
            <Button onClick={() => setShowDuplicateWarning(false)}>Go Back & Review</Button>
            <Button
              type="primary"
              onClick={() => {
                setShowDuplicateWarning(false);
                setCurrent(1);
              }}
            >
              Continue Anyway
            </Button>
          </Space>
        }
        style={{ width: '80%', maxWidth: 800 }}
      >
        <Alert
          type="warning"
          content="We found existing students with similar information. Please review the list below to ensure you're not creating a duplicate record."
          style={{ marginBottom: 16 }}
        />

        <Table
          columns={duplicateColumns}
          data={existingStudents}
          pagination={false}
          border
          size="small"
        />

        <Typography.Text type="secondary" style={{ display: 'block', marginTop: 16 }}>
          If you're certain this is a new student, click "Continue Anyway". Otherwise, click "Go
          Back & Review" to modify the information.
        </Typography.Text>
      </Modal>
    </>
  );
}

export default FormWizard;
