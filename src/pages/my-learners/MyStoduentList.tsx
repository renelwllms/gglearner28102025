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
  Alert,
  Badge,
  Tooltip,
  Empty,
} from '@arco-design/web-react';
import * as services from '@/services';
import { teacher } from '@/services/teacher';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import SearchForm from './form';
import Courses from './Courses';
import { IconDown, IconRight, IconEdit } from '@arco-design/web-react/icon';
import useForm from '@arco-design/web-react/es/Form/useForm';
import UpdateForm from '../learner-search/updateForm';
import ResizableTable from '@/components/ResizableTable';
import StudentCourses from '../StudentCourses';
import SendResults from '../SendResults';
import { retryRequest, showError, showRetryNotification } from '@/utils/errorHandler';

function MyStoduentList({LearnerStatus = null, AssignedTo = null, FollowUp = null, allowStatusFilter = false, allowLastCommFilter = false, allowStudentTypeFilter = false}) {
  const dispatch = useDispatch();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const token = useSelector((state: any) => state.token);
  const isAdmin = useSelector((state: any) => state.isAdmin);
  const [formParams, setFormParams] = useState({});
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
  const userInfo = useSelector((state: any) => state.userInfo);
  const [error, setError] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showSlowLoadingTip, setShowSlowLoadingTip] = useState(false);

  // Status badge helper function
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'on going':
        return { status: 'processing', text: status };
      case 'completed':
        return { status: 'success', text: status };
      case 'withdrawn':
        return { status: 'warning', text: status };
      case 'did not complete':
        return { status: 'error', text: status };
      case 'other':
        return { status: 'default', text: status };
      default:
        return { status: 'default', text: status || 'Unknown' };
    }
  };

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
                  setRow(item);
                  setAllCourseVisible(true);
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
        () => services.student.getMyStudent({
          ...pagination,
          ...formParams,
          ...data,
          total: undefined,
          LearnerStatus: LearnerStatus,
          AssignedTo: AssignedTo,
          FollowUp: FollowUp,
          Email: (isAdmin ? '' : userInfo.mail)
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

function handleSearch(params) { 
  console.log("params:", params);

  setPagination({ ...pagination, current: 1 });
  setFormParams(params);

  getList({
    current: 1,
    ...params,
  });
}

  const handleDelete = (StudentID) => {
    services.g
      .deleteStudentInfo({
        StudentID,
      })
      .then((res) => {
        if (res?.data) {
          Message.success('success');
          getList();
        }
      });
  };

  const handleSubmit = (values) => {
    setAddLoading(true);

    console.log("values");
    console.log(values);

    services.g
      .postStudentInfo({
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
      })
      .then((res) => {
        if (res?.data) {
          setVisible(false);
          Message.success('success');
          form.resetFields();
          getList();
        }
      })
      .finally(() => {
        setAddLoading(false);
      });
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

  

  return (
    <Card>
      <SearchForm onSearch={handleSearch} allowStatusFilter = {allowStatusFilter} allowLastCommFilter = {allowLastCommFilter} allowStudentTypeFilter = {allowStudentTypeFilter}/>
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
            icon={
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="32" cy="32" r="32" fill="#E8F3FF"/>
                <path
                  d="M32 16C23.2 16 16 23.2 16 32C16 40.8 23.2 48 32 48C40.8 48 48 40.8 48 32C48 23.2 40.8 16 32 16ZM32 44C25.4 44 20 38.6 20 32C20 25.4 25.4 20 32 20C38.6 20 44 25.4 44 32C44 38.6 38.6 44 32 44Z"
                  fill="#4E5969"
                />
                <path
                  d="M26 28C26 27.4 26.4 27 27 27H29C29.6 27 30 27.4 30 28V30C30 30.6 29.6 31 29 31H27C26.4 31 26 30.6 26 30V28Z"
                  fill="#4E5969"
                />
                <path
                  d="M34 28C34 27.4 34.4 27 35 27H37C37.6 27 38 27.4 38 28V30C38 30.6 37.6 31 37 31H35C34.4 31 34 30.6 34 30V28Z"
                  fill="#4E5969"
                />
                <path
                  d="M32 38C28.7 38 26 36.2 26 34H38C38 36.2 35.3 38 32 38Z"
                  fill="#4E5969"
                />
              </svg>
            }
            description={
              <div style={{ textAlign: 'center' }}>
                <Typography.Title heading={6} style={{ marginBottom: '8px', color: '#1D2129' }}>
                  No Learners Found
                </Typography.Title>
                <Typography.Text style={{ fontSize: '14px', color: '#86909C', display: 'block', marginBottom: '4px' }}>
                  {formParams && (Object.keys(formParams).length > 0 || LearnerStatus || AssignedTo || FollowUp)
                    ? "No learners match your current filters. Try adjusting your search criteria."
                    : "You don't have any learners assigned yet. Start by adding a new learner."}
                </Typography.Text>
                <div style={{ marginTop: '20px' }}>
                  {formParams && (Object.keys(formParams).length > 0 || LearnerStatus || AssignedTo || FollowUp) ? (
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
                  ) : (
                    <Button
                      type="primary"
                      onClick={() => {
                        history.push('/remote-register');
                      }}
                    >
                      Register New Learner
                    </Button>
                  )}
                </div>
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
    </Card>
  );
}

export default MyStoduentList;
