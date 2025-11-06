import React, { useState, useEffect } from 'react';
import {
  Steps,
  Form,
  Input,
  Select,
  Radio,
  DatePicker,
  Checkbox,
  Button,
  Message,
  Card,
  Alert,
  Space,
  Spin,
  Modal,
  Tag,
  Divider
} from '@arco-design/web-react';
import { IconCheck, IconClose, IconArrowLeft, IconArrowRight } from '@arco-design/web-react/icon';
import axios from 'axios';
import styles from './index.module.less';

const { Step } = Steps;
const { useForm } = Form;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const TextArea = Input.TextArea;

const ETHNICITY_OPTIONS = [
  'NZ European', 'Maori', 'Cook Island Maori', 'Niuean', 'Samoan',
  'Tongan', 'Fijian', 'Tokelauan', 'Chinese', 'Indian', 'Japanese',
  'Korean', 'Vietnamese', 'Filipino', 'Malaysian', 'Indonesian', 'Thai',
  'Middle Eastern/Latin American/African', 'Other'
];

const GENDER_OPTIONS = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Non-binary', value: 'Non-binary' },
  { label: 'Prefer not to say', value: 'Prefer not to say' },
];

const RemoteRegister = () => {
  const [form] = useForm();
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [duplicateCheck, setDuplicateCheck] = useState<any>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [selectedExistingStudent, setSelectedExistingStudent] = useState<number | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [unitStandards, setUnitStandards] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [pendingStepAdvance, setPendingStepAdvance] = useState(false);
  const [schoolOptions, setSchoolOptions] = useState<any[]>([]);
  const [existingStudentID, setExistingStudentID] = useState<number | null>(null);

  // Define fields for each step
  const stepFields = {
    0: ['FirstName', 'LastName', 'DateOfBirth', 'Gender', 'Ethnicity', 'PhoneNumber', 'Email', 'School'],
    1: ['TeacherName', 'TeacherEmail', 'InvoiceEmail', 'StreetAddress', 'City', 'Region', 'Zipcode', 'WorkbookOption', 'NZQAPreference'],
    2: ['CourseCategories', 'SelectedWorkLifeCourses', 'SelectedFarmingUnits', 'CustomCourse', 'AdditionalInfo'],
    3: ['Agreement']
  };

  // Load school options on mount
  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      const res = await axios.get('/api/report/school');
      console.log('Schools API response:', res.data);
      if (res.data.code === 0) {
        // Sort schools alphabetically
        const sortedSchools = (res.data.data || []).sort((a, b) => {
          const nameA = a.SchoolName?.toLowerCase() || '';
          const nameB = b.SchoolName?.toLowerCase() || '';
          return nameA.localeCompare(nameB);
        });
        console.log('Sorted schools:', sortedSchools.length);
        setSchoolOptions(sortedSchools);
      } else {
        console.error('School API error:', res.data);
      }
    } catch (error) {
      console.error('Error loading schools:', error);
    }
  };

  // Load courses and unit standards when categories change
  useEffect(() => {
    if (selectedCategories.length > 0) {
      selectedCategories.forEach(category => {
        if (category === 'Work & Life Skills') {
          loadCourses(category);
        } else if (category === 'Farming & Horticulture') {
          loadUnitStandards(category);
        }
      });
    }
  }, [selectedCategories]);

  // Initialize form with saved data when navigating between steps
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      form.setFieldsValue(formData);
      // Restore selected categories if they exist
      if (formData.CourseCategories) {
        setSelectedCategories(formData.CourseCategories);
      }
    }
  }, [current, formData]);

  // Advance to next step after formData has been updated
  useEffect(() => {
    if (pendingStepAdvance) {
      console.log('Advancing to next step with formData:', formData);
      setCurrent(current + 1);
      setPendingStepAdvance(false);
    }
  }, [pendingStepAdvance, formData]);

  const loadCourses = async (category: string) => {
    try {
      const res = await axios.get(`/api/course/publicCourseList?category=${encodeURIComponent(category)}`);
      if (res.data.code === 0) {
        setCourses(res.data.data || []);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      Message.error('Failed to load courses');
    }
  };

  const loadUnitStandards = async (category: string) => {
    try {
      const res = await axios.get(`/api/course/publicUnitStandards?category=${encodeURIComponent(category)}`);
      if (res.data.code === 0) {
        setUnitStandards(res.data.data || []);
      }
    } catch (error) {
      console.error('Error loading unit standards:', error);
      Message.error('Failed to load unit standards');
    }
  };

  const checkDuplicate = async (values: any) => {
    try {
      setLoading(true);

      // Convert DateOfBirth to SQL Server compatible format (YYYY-MM-DD)
      let dobFormatted = values.DateOfBirth;
      if (dobFormatted) {
        const date = new Date(dobFormatted);
        if (!isNaN(date.getTime())) {
          dobFormatted = date.toISOString().split('T')[0];
        }
      }

      const res = await axios.post('/api/student/checkDuplicate', {
        FirstName: values.FirstName,
        LastName: values.LastName,
        DateOfBirth: dobFormatted,
        Email: values.Email,
        School: values.School
      });

      if (res.data.code === 0 && res.data.data.exists) {
        setDuplicateCheck(res.data.data);
        setShowDuplicateModal(true);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking duplicate:', error);
      return true; // Continue anyway if check fails
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    try {
      // Get only the current step's fields
      const currentStepFields = stepFields[current];

      // Validate only current step's fields
      await form.validate(currentStepFields);

      // Get only the values for the current step's fields
      const currentStepValues = {};
      currentStepFields.forEach(field => {
        const value = form.getFieldValue(field);
        if (value !== undefined && value !== null) {
          currentStepValues[field] = value;
        }
      });

      console.log(`Step ${current} - Current Step Field Values:`, currentStepValues);
      console.log(`Step ${current} - Previous FormData:`, formData);

      // Merge with existing formData to preserve values from previous steps
      const values = { ...formData, ...currentStepValues };

      console.log(`Step ${current} - Merged Values:`, values);

      // Convert DateOfBirth to SQL Server compatible format (YYYY-MM-DD)
      if (values.DateOfBirth) {
        const date = new Date(values.DateOfBirth);
        if (!isNaN(date.getTime())) {
          values.DateOfBirth = date.toISOString().split('T')[0];
        }
      }

      // Step 0: After personal details, check for duplicates
      if (current === 0) {
        const canProceed = await checkDuplicate(values);
        if (!canProceed) {
          return; // Don't proceed if duplicate found
        }
      }

      console.log(`Step ${current} - Saving to FormData:`, values);
      // Update formData and trigger step advance via useEffect
      setFormData(values);
      setPendingStepAdvance(true);
    } catch (error) {
      console.error('Validation error:', error);
      Message.warning('Please fill in all required fields');
    }
  };

  const handlePrevious = () => {
    setCurrent(current - 1);
  };

  const handleSubmit = async () => {
    try {
      // Only validate the Agreement field (current step), not the entire form
      // Fields from previous steps are not mounted in the DOM
      await form.validate(['Agreement']);

      // Get only the current step's field value (Agreement)
      const agreementValue = form.getFieldValue('Agreement');
      const finalData = { ...formData, Agreement: agreementValue };

      console.log('Form Data:', formData);
      console.log('Agreement Value:', agreementValue);
      console.log('Final Data:', finalData);

      // Convert DateOfBirth to SQL Server compatible format (YYYY-MM-DD)
      if (finalData.DateOfBirth) {
        const date = new Date(finalData.DateOfBirth);
        if (!isNaN(date.getTime())) {
          finalData.DateOfBirth = date.toISOString().split('T')[0];
        }
      }

      // Combine Custom Course and Additional Info into AdditionalInfo field
      let combinedInfo = '';
      if (finalData.CustomCourse) {
        combinedInfo += `Custom Course: ${finalData.CustomCourse}`;
      }
      if (finalData.AdditionalInfo) {
        if (combinedInfo) combinedInfo += '\n\n';
        combinedInfo += `Additional Information: ${finalData.AdditionalInfo}`;
      }
      if (combinedInfo) {
        finalData.AdditionalInfo = combinedInfo;
      }
      delete finalData.CustomCourse; // Remove CustomCourse as it's now merged

      setLoading(true);

      // Add existing student ID if "This Is Me" was selected
      if (existingStudentID) {
        finalData.ExistingStudentID = existingStudentID;
        console.log('Enrolling existing student ID:', existingStudentID);
      }

      // Send all data in one request
      const res = await axios.post('/api/student/remoteRegister', finalData);

      if (res.data.code === 0) {
        const { StudentID, EnrolledCount } = res.data.data;
        Message.success('Registration successful!');
        Modal.success({
          title: 'Registration Successful!',
          content: (
            <div>
              <p>Thank you for registering with The GET Group!</p>
              <p>You have been enrolled in {EnrolledCount || 0} courses/unit standards.</p>
              <p>You will receive:</p>
              <ul>
                <li>A welcome email with course details</li>
                <li>An invoice within 48 hours</li>
                <li>Further instructions from your assigned tutor</li>
              </ul>
              <p style={{ marginTop: 16, fontWeight: 'bold' }}>
                Student ID: {StudentID}
              </p>
            </div>
          ),
          okText: 'OK',
          onOk: () => {
            window.location.reload();
          }
        });
      } else {
        Message.error(res.data.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      Message.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPersonalDetails = () => (
    <div className={styles.stepContent}>
      <h2 className={styles.stepTitle}>Personal Details</h2>
      <p className={styles.stepDescription}>
        Let's start with your basic information. We'll check if you're already in our system.
      </p>

      <FormItem label="First Name" field="FirstName" rules={[{ required: true }]}>
        <Input placeholder="Enter your first name" size="large" />
      </FormItem>

      <FormItem label="Last Name" field="LastName" rules={[{ required: true }]}>
        <Input placeholder="Enter your last name" size="large" />
      </FormItem>

      <FormItem label="Date of Birth" field="DateOfBirth" rules={[{ required: true }]}>
        <DatePicker
          style={{ width: '100%' }}
          size="large"
          format="DD/MM/YYYY"
        />
      </FormItem>

      <FormItem label="Gender" field="Gender" rules={[{ required: true }]}>
        <RadioGroup options={GENDER_OPTIONS} />
      </FormItem>

      <FormItem label="Ethnicity" field="Ethnicity" rules={[{ required: true }]}>
        <Select
          placeholder="Select your ethnicity"
          size="large"
          showSearch
          allowClear
        >
          {ETHNICITY_OPTIONS.map(eth => (
            <Select.Option key={eth} value={eth}>{eth}</Select.Option>
          ))}
        </Select>
      </FormItem>

      <FormItem label="Phone Number" field="PhoneNumber" rules={[{ required: true }]}>
        <Input placeholder="Enter your phone number" size="large" />
      </FormItem>

      <FormItem label="Email" field="Email" rules={[{ required: true, type: 'email' }]}>
        <Input placeholder="Enter your email address" size="large" />
      </FormItem>

      <FormItem label="School Name" field="School" rules={[{ required: true }]}>
        <Select
          placeholder="Select your school"
          size="large"
          showSearch
          allowClear
          allowCreate
          filterOption={(inputValue, option) => {
            return option.props.children?.toLowerCase().includes(inputValue.toLowerCase());
          }}
        >
          {schoolOptions.map((school) => (
            <Select.Option key={school.SchoolNumber} value={school.SchoolName}>
              {school.SchoolName}
            </Select.Option>
          ))}
        </Select>
      </FormItem>
    </div>
  );

  const renderSchoolDetails = () => (
    <div className={styles.stepContent}>
      <h2 className={styles.stepTitle}>School & Contact Information</h2>
      <p className={styles.stepDescription}>
        Tell us about your teacher and contact details
      </p>

      <FormItem label="Teacher Name" field="TeacherName">
        <Input placeholder="Your teacher or contact person" size="large" />
      </FormItem>

      <FormItem label="Teacher Email" field="TeacherEmail">
        <Input placeholder="Teacher's email address" size="large" />
      </FormItem>

      <FormItem
        label="Invoice Email"
        field="InvoiceEmail"
        rules={[{ required: true, type: 'email' }]}
      >
        <Input placeholder="Where should we send the invoice?" size="large" />
      </FormItem>

      <Divider />

      <h3 className={styles.sectionTitle}>Address (for workbook delivery)</h3>

      <FormItem label="Street Address" field="StreetAddress">
        <Input placeholder="Street address" size="large" />
      </FormItem>

      <FormItem label="City" field="City">
        <Input placeholder="City" size="large" />
      </FormItem>

      <FormItem label="Region" field="Region">
        <Input placeholder="Region" size="large" />
      </FormItem>

      <FormItem label="Postcode" field="Zipcode">
        <Input placeholder="Postcode" size="large" />
      </FormItem>

      <Divider />

      <h3 className={styles.sectionTitle}>Workbook Preference</h3>

      <FormItem field="WorkbookOption" rules={[{ required: true }]}>
        <RadioGroup>
          <Radio value="electronic">
            Electronic workbook ($180.00 + GST per workbook)
          </Radio>
          <Radio value="printed">
            Printed workbook ($200.00 + GST per workbook)
          </Radio>
        </RadioGroup>
      </FormItem>

      <FormItem field="NZQAPreference" rules={[{ required: true }]}>
        <RadioGroup>
          <Radio value="school">My school will be resulting the credits with NZQA</Radio>
          <Radio value="getgroup">
            I will need The GET Group to result the credits with NZQA
            (additional cost of $2.95 per credit)
          </Radio>
          <Radio value="unsure">I am not sure</Radio>
        </RadioGroup>
      </FormItem>
    </div>
  );

  const renderCourseSelection = () => (
    <div className={styles.stepContent}>
      <h2 className={styles.stepTitle}>Choose Your Pathway(s)</h2>
      <p className={styles.stepDescription}>
        Select one or both pathways that interest you
      </p>

      <FormItem field="CourseCategories" rules={[{ required: true, type: 'array', minLength: 1, message: 'Please select at least one pathway' }]}>
        <Checkbox.Group
          onChange={(values) => setSelectedCategories(values as string[])}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <Card className={styles.categoryCard}>
            <Checkbox value="Work & Life Skills">
              <div className={styles.categoryContent}>
                <h3>Work & Life Skills</h3>
                <p>Build essential skills for work and everyday life</p>
              </div>
            </Checkbox>
          </Card>

          <Card className={styles.categoryCard}>
            <Checkbox value="Farming & Horticulture">
              <div className={styles.categoryContent}>
                <h3>Farming & Horticulture</h3>
                <p>Learn practical skills for agriculture and horticulture</p>
              </div>
            </Checkbox>
          </Card>
        </Checkbox.Group>
      </FormItem>

      {selectedCategories.length > 0 && (
        <>
          <Divider />

          {selectedCategories.includes('Work & Life Skills') && (
            <>
              <h3 className={styles.sectionTitle}>
                Work & Life Skills Courses
              </h3>
              <p className={styles.helpText}>
                Choose one or more courses below
              </p>

              <FormItem field="SelectedWorkLifeCourses">
                <Checkbox.Group style={{ width: '100%' }}>
                  {courses.map((item: any) => (
                    <div key={item.CourseID} className={styles.courseOption}>
                      <Checkbox value={item.CourseID}>
                        {item.CourseName}
                        {item.CourseCredits && (
                          <Tag style={{ marginLeft: 8 }}>{item.CourseCredits} credits</Tag>
                        )}
                      </Checkbox>
                    </div>
                  ))}
                </Checkbox.Group>
              </FormItem>

              <Divider />
            </>
          )}

          {selectedCategories.includes('Farming & Horticulture') && (
            <>
              <h3 className={styles.sectionTitle}>
                Farming & Horticulture Unit Standards
              </h3>
              <p className={styles.helpText}>
                Choose one or more unit standards below
              </p>

              <FormItem field="SelectedFarmingUnits">
                <Checkbox.Group style={{ width: '100%' }}>
                  {unitStandards.map((item: any) => (
                    <div key={item.UnitStandardID} className={styles.courseOption}>
                      <Checkbox value={item.UnitStandardID}>
                        {item.US} - {item.USName}
                        {item.USCredits && (
                          <Tag style={{ marginLeft: 8 }}>{item.USCredits} credits</Tag>
                        )}
                      </Checkbox>
                    </div>
                  ))}
                </Checkbox.Group>
              </FormItem>

              <Divider />
            </>
          )}

          <FormItem label="Custom Course (Optional)" field="CustomCourse">
            <TextArea
              placeholder="Describe any specific courses or unit standards you'd like to pursue..."
              rows={4}
            />
          </FormItem>

          <FormItem label="Additional Information" field="AdditionalInfo">
            <TextArea
              placeholder="Any challenges or special requirements we should know about?"
              rows={3}
            />
          </FormItem>
        </>
      )}
    </div>
  );

  const renderAgreement = () => {
    // formData should now contain all the data from previous steps
    console.log('renderAgreement - formData:', formData);

    return (
      <div className={styles.stepContent}>
        <h2 className={styles.stepTitle}>Privacy & Agreement</h2>

        <Card className={styles.agreementCard}>
          <h3>Privacy and Declaration</h3>
          <div className={styles.agreementText}>
            <p>The provisions of Privacy Act NZ apply to all details held on this agreement and information held by The GET Group.</p>
            <p>By submitting this registration you are consenting to the sharing of your information with other parties for the purpose of reporting and organisational compliance. Please refer to website for full Privacy Policy.</p>
            <p><strong>Once you have submitted the form, you will receive an invoice within 48 hours.</strong></p>
          </div>

          <FormItem
            field="Agreement"
            rules={[{ required: true, message: 'You must agree to continue' }]}
            style={{ marginTop: 24 }}
          >
            <Checkbox>
              I agree to enrol in The GET Group Supported Remote Learning program and understand the requirements
            </Checkbox>
          </FormItem>
        </Card>

        <div className={styles.summaryCard}>
          <h3>Registration Summary</h3>
          <div className={styles.summaryItem}>
            <span>Name:</span>
            <strong>{formData.FirstName || 'Not provided'} {formData.LastName || ''}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Email:</span>
            <strong>{formData.Email || 'Not provided'}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>Pathway(s):</span>
            <strong>{formData.CourseCategories?.join(', ') || 'Not provided'}</strong>
          </div>
          {formData.SelectedWorkLifeCourses && formData.SelectedWorkLifeCourses.length > 0 && (
            <div className={styles.summaryItem}>
              <span>Work & Life Skills Courses:</span>
              <strong>{formData.SelectedWorkLifeCourses.length} selected</strong>
            </div>
          )}
          {formData.SelectedFarmingUnits && formData.SelectedFarmingUnits.length > 0 && (
            <div className={styles.summaryItem}>
              <span>Farming & Horticulture Units:</span>
              <strong>{formData.SelectedFarmingUnits.length} selected</strong>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Define step content dynamically so it updates when formData changes
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderPersonalDetails();
      case 1:
        return renderSchoolDetails();
      case 2:
        return renderCourseSelection();
      case 3:
        return renderAgreement();
      default:
        return null;
    }
  };

  const steps = [
    { title: 'Personal Details' },
    { title: 'School & Contact' },
    { title: 'Course Selection' },
    { title: 'Review & Submit' }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Remote Learner Registration</h1>
        <p className={styles.subtitle}>
          This form is for all you cool cats learning from home, at school, or on the job.
          Let's rock 'n roll!
        </p>
      </div>

      <Card className={styles.mainCard}>
        <Steps current={current} className={styles.steps}>
          {steps.map((step, index) => (
            <Step key={index} title={step.title} />
          ))}
        </Steps>

        <Spin loading={loading} style={{ width: '100%' }}>
          <Form
            form={form}
            layout="vertical"
            className={styles.form}
            size="large"
          >
            {getStepContent(current)}

            <div className={styles.actions}>
              {current > 0 && (
                <Button
                  size="large"
                  onClick={handlePrevious}
                  icon={<IconArrowLeft />}
                >
                  Previous
                </Button>
              )}

              {current < steps.length - 1 && (
                <Button
                  type="primary"
                  size="large"
                  onClick={handleNext}
                  icon={<IconArrowRight />}
                  iconOnly={false}
                >
                  Next
                </Button>
              )}

              {current === steps.length - 1 && (
                <Button
                  type="primary"
                  size="large"
                  onClick={handleSubmit}
                  loading={loading}
                  icon={<IconCheck />}
                >
                  Submit Registration
                </Button>
              )}
            </div>
          </Form>
        </Spin>
      </Card>

      <Modal
        title="Possible Duplicate Found"
        visible={showDuplicateModal}
        onCancel={() => {
          setShowDuplicateModal(false);
          setSelectedExistingStudent(null);
        }}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setShowDuplicateModal(false);
              setSelectedExistingStudent(null);
            }}
          >
            Go Back
          </Button>,
          <Button
            key="select"
            type="primary"
            disabled={selectedExistingStudent === null}
            onClick={() => {
              if (selectedExistingStudent !== null) {
                const student = duplicateCheck.students[selectedExistingStudent];
                console.log('Selected existing student:', student);

                // Store the existing student ID to use for enrollment
                setExistingStudentID(student.StudentID);

                // Populate the form with the existing student's data
                const existingData = {
                  FirstName: student.FirstName,
                  LastName: student.LastName,
                  Email: student.Email,
                  DateOfBirth: student.DateOfBirth,
                  Gender: student.Gender,
                  Ethnicity: student.Ethnicity,
                  PhoneNumber: student.PhoneNumber || '',
                  School: student.School || student.SchoolName || '',
                };

                // Update form fields
                form.setFieldsValue(existingData);

                // Update formData state
                setFormData(existingData);

                // Close modal
                setShowDuplicateModal(false);
                setSelectedExistingStudent(null);

                // Show success notification
                Message.success(`Using existing record for ${student.FirstName} ${student.LastName}. Adding new course enrollment.`);

                // Move to next step (School & Contact)
                setCurrent(1);
              }
            }}
          >
            This Is Me
          </Button>,
          <Button
            key="continue"
            onClick={() => {
              // Save the current step's data before advancing
              const currentStepFields = stepFields[current];
              const currentStepValues = {};
              currentStepFields.forEach(field => {
                const value = form.getFieldValue(field);
                if (value !== undefined && value !== null) {
                  currentStepValues[field] = value;
                }
              });

              // Merge with existing formData
              const values = { ...formData, ...currentStepValues };

              // Convert DateOfBirth to SQL format
              if (values.DateOfBirth) {
                const date = new Date(values.DateOfBirth);
                if (!isNaN(date.getTime())) {
                  values.DateOfBirth = date.toISOString().split('T')[0];
                }
              }

              console.log('Duplicate Modal - Continue Anyway - Saving:', values);

              // Save data and advance
              setFormData(values);
              setShowDuplicateModal(false);
              setSelectedExistingStudent(null);
              setCurrent(current + 1);
            }}
          >
            Continue Anyway (New Person)
          </Button>,
        ]}
      >
        <Alert
          type="warning"
          content="We found existing records that might match your information. Please select if one of these is you, or continue with a new registration:"
          style={{ marginBottom: 16 }}
        />

        <Radio.Group
          value={selectedExistingStudent}
          onChange={(value) => setSelectedExistingStudent(value)}
          style={{ width: '100%' }}
        >
          {duplicateCheck?.students?.map((student: any, idx: number) => (
            <Card
              key={idx}
              style={{
                marginBottom: 12,
                cursor: 'pointer',
                border: selectedExistingStudent === idx ? '2px solid #E91E63' : '1px solid #E0E0E0',
              }}
              onClick={() => setSelectedExistingStudent(idx)}
            >
              <Radio value={idx}>
                <div style={{ marginLeft: 8 }}>
                  <p style={{ margin: '4px 0' }}>
                    <strong>{student.FirstName} {student.LastName}</strong>
                  </p>
                  <p style={{ margin: '4px 0', color: '#666' }}>School: {student.School || 'N/A'}</p>
                  <p style={{ margin: '4px 0', color: '#666' }}>Status: {student.Status || 'N/A'}</p>
                </div>
              </Radio>
            </Card>
          ))}
        </Radio.Group>

        <Alert
          type="info"
          content="Select 'This Is Me' if you found your record above and want to update it (you'll need to contact us). Otherwise, select 'Continue Anyway' to proceed with a new registration."
          style={{ marginTop: 16 }}
        />
      </Modal>
    </div>
  );
};

export default RemoteRegister;
