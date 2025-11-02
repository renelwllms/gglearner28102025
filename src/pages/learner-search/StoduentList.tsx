import React, { useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import {
  Typography,
  Card,
  Button,
  Table,
  TableColumnProps,
  Modal,
  Space,
  Popconfirm,
  Select,
  Message,
  Descriptions,
  Tooltip,
  Badge,
  Form,
  Input,
  Alert,
  Empty,
} from '@arco-design/web-react';
import * as services from '@/services';
import { teacher } from '@/services/teacher';
import { useDispatch, useSelector } from 'react-redux';
import SearchForm from './form';
import Courses from './Courses';
import { IconDown, IconRight, IconEdit } from '@arco-design/web-react/icon';
import useForm from '@arco-design/web-react/es/Form/useForm';
import UpdateForm from './updateForm';
import ResizableTable from '@/components/ResizableTable';
import StudentCourses from '../StudentCourses';
import SendResults from '../SendResults';
import { showError, retryRequest, showRetryNotification } from '@/utils/errorHandler';

/**
 * Get badge status and color based on learner status
 */
const getStatusBadge = (status: string) => {
  const statusLower = status?.toLowerCase() || '';

  if (statusLower.includes('completed') || statusLower === 'completed') {
    return { status: 'success', text: status };
  }

  if (statusLower.includes('on going') || statusLower.includes('ongoing') || statusLower === 'on going') {
    return { status: 'processing', text: status };
  }

  if (statusLower.includes('withdrawn')) {
    return { status: 'warning', text: status };
  }

  if (statusLower.includes('did not complete') || statusLower.includes('incomplete')) {
    return { status: 'error', text: status };
  }

  // Default for 'Other' or unknown statuses
  return { status: 'default', text: status || '-' };
};

function LearnerSearch({LearnerStatus = null, AssignedTo = null, FollowUp = null, formParams = {}}) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const token = useSelector((state: any) => state.token);
  const isAdmin = useSelector((state: any) => state.isAdmin);
  const [pagination, setPagination] = useState({
    total: 0,
    pageSize: 10,
    current: 1,
  });
  const [coursesVisible, setCoursesVisible] = useState(false);
  const [rowData, setRow] = useState<any>({});
  const [tutor, setTutor] = useState('');
  const [courseVal, setCourseVal] = useState<any>({});
  const [form] = useForm();
  const [courseOption, setCourse] = useState([]);
  const [tutorOption, setTutorOption] = useState([]);
  const [visible, setVisible] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [columns, setColumns] = useState([]);
  const [columnsKey, setColumnsKey] = useState(1);
  const [allCourseVisible, setAllCourseVisible] = useState(false);
  const [sendResultVisible, setSendResultVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [bulkTutor, setBulkTutor] = useState('');
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkTutorVisible, setBulkTutorVisible] = useState(false);
  const [bulkStatusVisible, setBulkStatusVisible] = useState(false);
  const [bulkDeleteVisible, setBulkDeleteVisible] = useState(false);
  const [bulkEmailVisible, setBulkEmailVisible] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [error, setError] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showSlowLoadingTip, setShowSlowLoadingTip] = useState(false);

  useEffect(() => {
    const Operation = isAdmin
      ? [
        {
          title: 'Operation',
          dataIndex: 'operation',
          key: 'operation',
          width: 150,
          render: (_e, item) => (
            <Space>
              <Button
                type="primary"
                size="mini"
                onClick={(e) => {
                  e.stopPropagation();
                  /*setAssessData(item);*/
                  setRow(item);
                  setAllCourseVisible(true);
                  console.log(rowData);
                }}
              >
                Courses
              </Button>
              <Button
                type="primary"
                size="mini"
                onClick={(e) => {
                  e.stopPropagation();
                  setRow(item);
                  form.setFieldsValue({
                    ...item,
                    SchoolName: item.SchoolNumber
                      ? item.SchoolNumber
                      : item.SchoolName,
                  });
                  setFormFieldsValue(item);
                  setVisible(true);
                }}
              >
                Edit
              </Button>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Popconfirm
                  focusLock
                  title="Confirm"
                  content="Are you sure you want to delete?"
                  onOk={() => {
                    handleDelete(item.StudentID);
                  }}
                >
                  <Button type="primary" status="danger" size="mini">
                    Delete
                  </Button>
                </Popconfirm>
              </div>
            </Space>
          ),
        },
      ]
      : [];

    setColumns([
      {
        title: 'Learner Name',
        key: 'StudentName',
        dataIndex: 'StudentName',
        width: 180,
        ellipsis: true,
        render: (_e, item) => {
          return (
            <Tooltip content="Double-click row to edit">
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {`${item.FirstName || ''} ${item.LastName || ''}`}
                <IconEdit style={{ fontSize: '12px', color: '#86909c', opacity: 0.6 }} />
              </span>
            </Tooltip>
          );
        },
      },
      {
        title: 'Registration Date',
        dataIndex: 'CreateDate',
        key: 'CreateDate',
        width: 150,
        ellipsis: true,
        render: (date) => date ? moment.utc(date).format('DD/MM/YYYY') : '-',
      },
      {
        title: 'School',
        dataIndex: 'School',
        key: 'School',
        ellipsis: true,
        width: 160,
      },
      {
        title: 'Status',
        dataIndex: 'Status',
        key: 'Status',
        width: 140,
        render: (_e, item) => {
          const badge = getStatusBadge(item.Status);
          return (
            <Badge status={badge.status as any} text={badge.text} />
          );
        },
      },
      {
        title: 'Assigned To',
        dataIndex: 'AssignedTo',
        key: 'AssignedTo',
        ellipsis: true,
        width: 150,
      },
      {
        title: 'Teacher',
        dataIndex: 'Tutor',
        key: 'Tutor',
        ellipsis: true,
        width: 150,
      },
      {
        title: 'Email',
        dataIndex: 'Email',
        key: 'Email',
        ellipsis: true,
        width: 200,
      },
      ...Operation,
    ]);
    setColumnsKey(columnsKey + 1);
  }, [isAdmin]);

  useEffect(() => {
    if (token) {
      getList();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      // Reset to first page when formParams change
      setPagination({ ...pagination, current: 1 });
      getList({ current: 1 });
    }
  }, [formParams]);

  const setFormFieldsValue = (item) => {
    form.setFieldsValue({
      ...item,
      FarmingUnitID: { "value": item.FarmingUnitID, "label": item.FarmingUnits },
      HospitalityCourseID: { "value": item.HospitalityCourseID, "label": item.HospitalityCourses },
      WorklifeCoursesID: { "value": item.WorklifeCoursesID, "label": item.WorklifeCourses }
    });
  }

  const setStudentTutor = (data) => {
    services.student.setStudentTutor(data).then((res) => {
      Message.success(res?.data);
      getList();
    });
  };

  const setStudentCourse = (data) => {
    services.student.setStudentCourse(data).then((res) => {
      Message.success(res?.data);
      getList();
    });
  };

  const getList = async (data = {}) => {
    setLoading(true);
    setError(null);
    setShowSlowLoadingTip(false);

    // Show tip if loading takes more than 5 seconds
    const slowLoadingTimer = setTimeout(() => {
      if (loading) {
        setShowSlowLoadingTip(true);
      }
    }, 5000);

    try {
      const res = await retryRequest(
        () => services.student.getStudentList({
          ...pagination,
          LearnerStatus: LearnerStatus,
          AssignedTo: AssignedTo,
          FollowUp : FollowUp,
          ...formParams,
          ...data,
          total: undefined
        }),
        {
          maxRetries: 2,
          onRetry: (attempt) => {
            setRetryCount(attempt);
            showRetryNotification(attempt, 2);
          },
        }
      );

      clearTimeout(slowLoadingTimer);
      setData(res?.data || []);
      setPagination({ ...pagination, ...res?.pagination });
      setRetryCount(0);
      setError(null);
      setShowSlowLoadingTip(false);
    } catch (err) {
      clearTimeout(slowLoadingTimer);
      console.error('Failed to load learner list:', err);
      setError(err);
      setShowSlowLoadingTip(false);

      // Check if it's a timeout error
      if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout') || err?.message?.includes('Timeout')) {
        Message.error({
          content: 'Database connection timeout. The server is taking too long to respond. Please try again.',
          duration: 5000,
        });
      } else if (err?.response?.status === 401) {
        Message.error({
          content: 'Session expired. Please refresh the page and log in again.',
          duration: 5000,
        });
      } else {
        showError(err, 'Failed to load learner list. Please check your connection and try again.');
      }

      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const onChangeTable = (pagination) => {
    const { current, pageSize } = pagination;
    setPagination({ ...pagination, current, pageSize });
    getList({ current, pageSize });
  };

  const handleDelete = async (StudentID) => {
    try {
      const res = await services.g.deleteStudentInfo({
        StudentID,
      });

      if (res?.data) {
        Message.success('Learner deleted successfully');
        getList();
      }
    } catch (err) {
      showError(err, 'Failed to delete learner');
    }
  };

  const handleSubmit = async (values) => {
    setAddLoading(true);

    try {
      const res = await services.g.postStudentInfo({
        StudentID: rowData.StudentID,
        ...values,
        CourseID: values?.CourseID?.value,
        CourseName: values?.CourseID?.label,
        FarmingUnits: values?.FarmingUnitID?.label,
        FarmingUnitID: values?.FarmingUnitID?.value,
        HospitalityCourses: values?.HospitalityCourseID?.label,
        HospitalityCourseID: values?.HospitalityCourseID?.value,
        WorklifeCourses: values?.WorklifeCoursesID?.label,
        WorklifeCoursesID: values?.WorklifeCoursesID?.value,
      });

      if (res?.data) {
        setVisible(false);
        Message.success('Learner updated successfully');
        form.resetFields();
        getList();
      }
    } catch (err) {
      showError(err, 'Failed to update learner');
    } finally {
      setAddLoading(false);
    }
  };

  const handleRowRender = (row) => {
    // Personal Information Section
    const personalInfo = [
      {
        label: 'DOB:',
        value: row['DateOfBirth'] ? moment(row['DateOfBirth']).format('DD/MM/YYYY') : '-',
      },
      {
        label: 'Gender:',
        value: row['Gender'] || '-',
      },
      {
        label: 'Ethnicity:',
        value: row['Ethnicity'] || '-',
      },
    ];

    // Contact Information Section
    const contactInfo = [
      {
        label: 'Phone Number:',
        value: row['PhoneNumber'] || '-',
      },
      {
        label: 'Address:',
        value:
          !row.StreetAddress && !row.City && !row.Region
            ? '-'
            : `${row.StreetAddress || ''}, ${row.City || ''}, ${row.Region || ''}`,
      },
      {
        label: 'Zipcode:',
        value: row['Zipcode'] || '-',
      },
    ];

    // School & Teaching Section
    const schoolInfo = [
      {
        label: 'Teacher Name:',
        value: row['TeacherName'] || '-',
      },
      {
        label: 'Teacher Email:',
        value: row['TeacherEmail'] || '-',
      },
      {
        label: 'Invoice Email:',
        value: row['InvoiceEmail'] || '-',
      },
    ];

    // Enrollment Details Section
    const enrollmentInfo = [
      {
        label: 'Registration Date:',
        value: row['CreateDate'] ? moment.utc(row['CreateDate']).format('DD/MM/YYYY HH:mm') : '-',
      },
      {
        label: 'Tutor:',
        value: row['Tutor'] || '-',
      },
      {
        label: 'Fees:',
        value: row['Fees'] || '-',
      },
      {
        label: 'Workbook Option:',
        value: row['WorkbookOption'] || '-',
      },
      {
        label: 'Additional Info:',
        value: row['AdditionalInfo'] || '-',
      },
    ];

    return (
      <>
        {isAdmin && (
          <div style={{ marginBottom: 12, padding: '8px 12px', background: '#f7f8fa', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IconEdit style={{ fontSize: '14px', color: '#4e5969' }} />
            <Typography.Text style={{ fontSize: '13px', color: '#4e5969' }}>
              Tip: Double-click this row to quickly edit learner details
            </Typography.Text>
          </div>
        )}

        {/* Personal Information Section */}
        <div style={{ marginBottom: 16 }}>
          <Typography.Text style={{ fontSize: '14px', fontWeight: 600, color: '#1d2129', marginBottom: 8, display: 'block' }}>
            Personal Information
          </Typography.Text>
          <Descriptions
            layout="inline-horizontal"
            border
            column={{
              xs: 1,
              sm: 2,
              md: 2,
              lg: 3,
              xl: 3,
              xxl: 3,
            }}
            data={personalInfo}
          />
        </div>

        {/* Contact Information Section */}
        <div style={{ marginBottom: 16 }}>
          <Typography.Text style={{ fontSize: '14px', fontWeight: 600, color: '#1d2129', marginBottom: 8, display: 'block' }}>
            Contact Information
          </Typography.Text>
          <Descriptions
            layout="inline-horizontal"
            border
            column={{
              xs: 1,
              sm: 2,
              md: 2,
              lg: 3,
              xl: 3,
              xxl: 3,
            }}
            data={contactInfo}
          />
        </div>

        {/* School & Teaching Section */}
        <div style={{ marginBottom: 16 }}>
          <Typography.Text style={{ fontSize: '14px', fontWeight: 600, color: '#1d2129', marginBottom: 8, display: 'block' }}>
            School & Teaching
          </Typography.Text>
          <Descriptions
            layout="inline-horizontal"
            border
            column={{
              xs: 1,
              sm: 2,
              md: 2,
              lg: 3,
              xl: 3,
              xxl: 3,
            }}
            data={schoolInfo}
          />
        </div>

        {/* Enrollment Details Section */}
        <div style={{ marginBottom: 16 }}>
          <Typography.Text style={{ fontSize: '14px', fontWeight: 600, color: '#1d2129', marginBottom: 8, display: 'block' }}>
            Enrollment Details
          </Typography.Text>
          <Descriptions
            layout="inline-horizontal"
            border
            column={{
              xs: 1,
              sm: 2,
              md: 2,
              lg: 3,
              xl: 4,
              xxl: 4,
            }}
            data={enrollmentInfo}
          />
        </div>
        <Space>
          {/* <Button
            type="primary"
            size="mini"
            onClick={(e) => {
              e.stopPropagation();
              setRow(row);
              setCoursesVisible(true);
            }}
          >
            Courses filled in on the forms
          </Button> */}
          {isAdmin && (
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Popconfirm
                focusLock
                icon={null}
                title={
                  <div style={{ width: '300px' }}>
                    <p> Assign Course</p>

                    <Select
                      allowCreate
                      labelInValue
                      showSearch
                      allowClear
                      options={courseOption.map((it) => ({
                        label: it.CourseName,
                        value: it.CourseID,
                      }))}
                      filterOption={(inputValue, option) =>
                        option.props.value?.label
                          ?.toLowerCase()
                          .indexOf(inputValue.toLowerCase()) >= 0 ||
                        option.props?.children
                          .toLowerCase()
                          .indexOf(inputValue.toLowerCase()) >= 0
                      }
                      placeholder="please enter"
                      onChange={(e) => {
                        setCourseVal(e);
                      }}
                    />
                  </div>
                }
                okText="ok"
                cancelText="cancel"
                onVisibleChange={(v) => {
                  if (v) {
                    services.g.getCourse({}).then((res) => {
                      setCourse(res?.data || []);
                    });
                  }
                }}
                onOk={() => {
                  setStudentCourse({
                    id: row.StudentID,
                    CourseName: courseVal.label,
                    CourseID: courseVal.value,
                  });
                }}
              >
                {/* <Button type="primary" size="mini">
                  Assign Course
                </Button> */}
              </Popconfirm>
            </div>
          )}
          {isAdmin && (
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Popconfirm
                focusLock
                icon={null}
                title={
                  <div style={{ width: '200px' }}>
                    <p>Assign to a tutor</p>
                    <Select
                      defaultValue={row.Tutor || void 0}
                      showSearch
                      placeholder="please enter"
                      options={tutorOption.map((it) => ({
                        label: it.DeliverySpecialist,
                        value: it.Id,
                      }))}
                      onChange={(e) => {
                        setTutor(e);
                      }}
                    />
                  </div>
                }
                okText="ok"
                cancelText="cancel"
                onVisibleChange={(v) => {
                  if (v) {
                    teacher.getAll({}).then((res) => {
                      setTutorOption(res?.data || []);
                    });
                    setTutor(row.Tutor);
                  }
                }}
                onOk={() => {
                  setStudentTutor({
                    id: row.StudentID,
                    tutor,
                  });
                }}
              >
                <Button type="primary" size="mini">
                  Assign to a tutor
                </Button>
              </Popconfirm>
            </div>
          )}
        </Space>
      </>
    );
  };

  const handleModalCancel = () => {
    setVisible(false);
    form.resetFields();
  }

  const handleSendResultVisible = (val) => {
    setSendResultVisible(val || false);
  }

  const handleBulkAssignTutor = async () => {
    if (!bulkTutor || selectedRowKeys.length === 0) {
      Message.warning('Please select learners and a tutor');
      return;
    }

    setLoading(true);

    try {
      const promises = selectedRowKeys.map((id) =>
        services.student.setStudentTutor({
          id,
          tutor: bulkTutor,
        })
      );

      await Promise.all(promises);

      Message.success(`Successfully assigned tutor to ${selectedRowKeys.length} learner(s)`);
      setSelectedRowKeys([]);
      setBulkTutorVisible(false);
      setBulkTutor('');
      getList();
    } catch (err) {
      showError(err, 'Failed to assign tutor to some learners');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpdateStatus = async () => {
    if (!bulkStatus || selectedRowKeys.length === 0) {
      Message.warning('Please select learners and a status');
      return;
    }

    setLoading(true);

    try {
      const promises = selectedRowKeys.map((id) =>
        services.g.postStudentInfo({
          StudentID: id,
          Status: bulkStatus,
          type: 1,
        })
      );

      await Promise.all(promises);

      Message.success(`Successfully updated status for ${selectedRowKeys.length} learner(s)`);
      setSelectedRowKeys([]);
      setBulkStatusVisible(false);
      setBulkStatus('');
      getList();
    } catch (err) {
      showError(err, 'Failed to update status for some learners');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) {
      Message.warning('Please select learners to delete');
      return;
    }

    setLoading(true);

    try {
      const promises = selectedRowKeys.map((id) =>
        services.g.deleteStudentInfo({
          StudentID: id,
        })
      );

      await Promise.all(promises);

      Message.success(`Successfully deleted ${selectedRowKeys.length} learner(s)`);
      setSelectedRowKeys([]);
      setBulkDeleteVisible(false);
      getList();
    } catch (err) {
      showError(err, 'Failed to delete some learners');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkEmail = () => {
    if (selectedRowKeys.length === 0) {
      Message.warning('Please select learners to email');
      return;
    }

    // Get selected learner emails
    const selectedLearners = data.filter(learner =>
      selectedRowKeys.includes(learner.StudentID)
    );
    const emails = selectedLearners
      .map(learner => learner.Email)
      .filter(email => email && email.trim() !== '');

    if (emails.length === 0) {
      Message.warning('No valid email addresses found for selected learners');
      return;
    }

    // Create mailto link with BCC to protect privacy
    const mailtoLink = `mailto:?bcc=${emails.join(',')}&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

    // Open default email client
    window.location.href = mailtoLink;

    Message.success(`Opening email client with ${emails.length} recipient(s)`);
    setBulkEmailVisible(false);
    setEmailSubject('');
    setEmailBody('');
  };



  return (
    <>
      {showSlowLoadingTip && loading && !error && (
        <Alert
          type="info"
          closable
          onClose={() => setShowSlowLoadingTip(false)}
          content={
            <div>
              <Typography.Text style={{ fontWeight: 600 }}>Loading is taking longer than expected...</Typography.Text>
              <Typography.Text style={{ display: 'block', marginTop: '4px', fontSize: '13px' }}>
                The database might be under heavy load or experiencing network latency. Please wait or try refreshing if it takes too long.
              </Typography.Text>
            </div>
          }
          style={{ marginBottom: 16 }}
        />
      )}
      {error && (
        <div style={{ marginBottom: 16, padding: '16px', background: '#fff2e8', borderRadius: '4px', border: '1px solid #ff7d00' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Typography.Text style={{ fontWeight: 600, color: '#d46b08', fontSize: '14px' }}>
                  ⚠️ Unable to Load Learners
                </Typography.Text>
                <Typography.Text style={{ display: 'block', marginTop: '4px', fontSize: '13px', color: '#8c8c8c' }}>
                  {error?.code === 'ECONNABORTED' || error?.message?.includes('timeout') || error?.message?.includes('Timeout')
                    ? 'The database connection timed out. This may be due to slow network or heavy server load.'
                    : error?.response?.status === 401
                    ? 'Your session has expired. Please refresh the page to log in again.'
                    : 'There was an error connecting to the server. Please check your internet connection.'}
                </Typography.Text>
              </div>
              <Space>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => getList()}
                  loading={loading}
                >
                  Retry Now
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    setError(null);
                    setData([]);
                  }}
                >
                  Dismiss
                </Button>
              </Space>
            </div>
            {retryCount > 0 && (
              <Typography.Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
                Attempted {retryCount} retries...
              </Typography.Text>
            )}
          </Space>
        </div>
      )}
      {isAdmin && selectedRowKeys.length > 0 && (
        <div style={{ marginBottom: 16, padding: '12px', background: '#f0f2f5', borderRadius: '4px' }}>
          <Space>
            <Typography.Text>
              {selectedRowKeys.length} learner(s) selected
            </Typography.Text>
            <Button
              type="primary"
              size="small"
              onClick={() => {
                teacher.getAll({}).then((res) => {
                  setTutorOption(res?.data || []);
                });
                setBulkTutorVisible(true);
              }}
            >
              Assign Tutor
            </Button>
            <Button
              type="primary"
              size="small"
              onClick={() => setBulkStatusVisible(true)}
            >
              Update Status
            </Button>
            <Button
              type="primary"
              size="small"
              onClick={() => setBulkEmailVisible(true)}
            >
              Email Selected
            </Button>
            <Button
              type="primary"
              status="danger"
              size="small"
              onClick={() => setBulkDeleteVisible(true)}
            >
              Delete Selected
            </Button>
            <Button
              size="small"
              onClick={() => setSelectedRowKeys([])}
            >
              Clear Selection
            </Button>
          </Space>
        </div>
      )}
      {!loading && !error && data.length === 0 ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          background: '#f7f8fa',
          borderRadius: '4px',
          padding: '40px'
        }}>
          <Empty
            description={
              <div style={{ textAlign: 'center' }}>
                <Typography.Title heading={6} style={{ marginBottom: '8px', color: '#1D2129' }}>
                  No Learners Found
                </Typography.Title>
                <Typography.Text style={{ fontSize: '14px', color: '#86909C', display: 'block', marginBottom: '4px' }}>
                  {formParams && Object.keys(formParams).length > 0
                    ? "No learners match your current filters. Try adjusting your search criteria."
                    : LearnerStatus || AssignedTo || FollowUp
                    ? `No learners found with the current filter criteria.`
                    : "No learners found in the system."}
                </Typography.Text>
                {formParams && Object.keys(formParams).length > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    <Button
                      type="outline"
                      onClick={() => {
                        setFormParams({});
                        setPagination({ ...pagination, current: 1 });
                        getList({ current: 1 });
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            }
          />
        </div>
      ) : (
        <ResizableTable
          key={columnsKey}
          columns={columns}
          rowKey={'StudentID'}
          expandedRowRender={handleRowRender}
        expandProps={{
          icon: ({ expanded, record, ...restProps }) =>
            expanded ? (
              <button {...restProps}>
                <IconDown />
              </button>
            ) : (
              <button {...restProps}>
                <IconRight />
              </button>
            ),
          expandRowByClick: true,
        }}
        rowSelection={
          isAdmin
            ? {
                type: 'checkbox',
                selectedRowKeys,
                onChange: (selectedRowKeys, selectedRows) => {
                  setSelectedRowKeys(selectedRowKeys);
                },
                checkAll: true,
              }
            : undefined
        }
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
        onRow={(item, index) => ({
          onDoubleClick: () => {
            setRow(item);
            form.setFieldsValue({
              ...item,
              SchoolName: item.SchoolNumber
                ? item.SchoolNumber
                : item.SchoolName,
            });
            setFormFieldsValue(item);
            setVisible(true);

          }
        })}
        />
      )}

      <Modal
        title="Courses filled in on the forms"
        visible={coursesVisible}
        footer={
          <div style={{ textAlign: 'center' }}>
            <Button type="primary" onClick={() => setCoursesVisible(false)}>
              {'ok'}
            </Button>
          </div>
        }
        onCancel={() => setCoursesVisible(false)}
        autoFocus={false}
        focusLock={true}
        unmountOnExit={true}
        style={{ width: '800px' }}
      >
        <Courses rowData={rowData}></Courses>
      </Modal>

      <Modal
        title={`Edit Learner`}
        visible={visible}
        footer={null}
        onCancel={() => {
          setVisible(false);
          form.resetFields();
        }}
        autoFocus={false}
        focusLock={true}
        unmountOnExit={true}
        style={{ width: '80%', height: '950px' }}
      >
        <UpdateForm
          form={form}
          handleSubmit={handleSubmit}
          handleCancel={handleModalCancel}
          loading={addLoading}
          headerInfo={rowData}
        ></UpdateForm>
      </Modal>

      <StudentCourses
        allCourseisibility={allCourseVisible}
        setAllCourseVisible={setAllCourseVisible}
        studentData={rowData}
      />
      <SendResults
        sendResultVisible={sendResultVisible}
        sendResultVisibleHandle={handleSendResultVisible}
        rowData={rowData}
        isWorkshop={false}
        ok={() => {
          setSendResultVisible(false);
        }}
      >
      </SendResults>

      {/* Bulk Assign Tutor Modal */}
      <Modal
        title="Bulk Assign Tutor"
        visible={bulkTutorVisible}
        onOk={handleBulkAssignTutor}
        onCancel={() => {
          setBulkTutorVisible(false);
          setBulkTutor('');
        }}
        confirmLoading={loading}
      >
        <div style={{ marginBottom: 16 }}>
          <Typography.Text>
            Assign tutor to {selectedRowKeys.length} selected learner(s)
          </Typography.Text>
        </div>
        <Select
          placeholder="Select a tutor"
          showSearch
          style={{ width: '100%' }}
          options={tutorOption.map((it) => ({
            label: it.DeliverySpecialist,
            value: it.Id,
          }))}
          onChange={(value) => setBulkTutor(value)}
          value={bulkTutor}
        />
      </Modal>

      {/* Bulk Update Status Modal */}
      <Modal
        title="Bulk Update Status"
        visible={bulkStatusVisible}
        onOk={handleBulkUpdateStatus}
        onCancel={() => {
          setBulkStatusVisible(false);
          setBulkStatus('');
        }}
        confirmLoading={loading}
      >
        <div style={{ marginBottom: 16 }}>
          <Typography.Text>
            Update status for {selectedRowKeys.length} selected learner(s)
          </Typography.Text>
        </div>
        <Select
          placeholder="Select a status"
          style={{ width: '100%' }}
          options={['On Going', 'Withdrawn', 'Did Not Complete', 'Completed', 'Other']}
          onChange={(value) => setBulkStatus(value)}
          value={bulkStatus}
        />
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal
        title="Confirm Bulk Delete"
        visible={bulkDeleteVisible}
        onOk={handleBulkDelete}
        onCancel={() => setBulkDeleteVisible(false)}
        confirmLoading={loading}
      >
        <Typography.Text type="danger">
          Are you sure you want to delete {selectedRowKeys.length} selected learner(s)? This action cannot be undone.
        </Typography.Text>
      </Modal>

      {/* Bulk Email Modal */}
      <Modal
        title="Send Email to Selected Learners"
        visible={bulkEmailVisible}
        onOk={handleBulkEmail}
        onCancel={() => {
          setBulkEmailVisible(false);
          setEmailSubject('');
          setEmailBody('');
        }}
        style={{ width: '600px' }}
      >
        <div style={{ marginBottom: 16 }}>
          <Typography.Text>
            Email {selectedRowKeys.length} selected learner(s)
          </Typography.Text>
          <Typography.Text type="secondary" style={{ display: 'block', fontSize: '12px', marginTop: '4px' }}>
            Note: This will open your default email client with recipients in BCC for privacy
          </Typography.Text>
        </div>
        <Form layout="vertical">
          <Form.Item label="Subject" required>
            <Input
              placeholder="Enter email subject"
              value={emailSubject}
              onChange={(value) => setEmailSubject(value)}
            />
          </Form.Item>
          <Form.Item label="Message" required>
            <Input.TextArea
              placeholder="Enter email message"
              value={emailBody}
              onChange={(value) => setEmailBody(value)}
              autoSize={{ minRows: 6, maxRows: 12 }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default LearnerSearch;
