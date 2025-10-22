import React, { useEffect, useState } from 'react';
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
} from '@arco-design/web-react';
import * as services from '@/services';
import {useDispatch, useSelector } from 'react-redux';
import SearchForm from './wForm';
import Courses from './Courses';
import { IconDown, IconRight } from '@arco-design/web-react/icon';
import ResizableTable from '@/components/ResizableTable';
import AddForm from '../Learner/form';
import useForm from '@arco-design/web-react/es/Form/useForm';

function LearnerSearch() {
  const dispatch = useDispatch();
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
  useEffect(() => {
    const Operation = isAdmin
      ? [
          {
            title: 'Operation',
            dataIndex: 'operation',
            key: 'operation',
            render: (_e, item: any) => (
              <Space>
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
                    setVisible(true);
                  }}
                >
                  Edit
                </Button>
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
              </Space>
            ),
            width: 150,
          },
        ]
      : [];

    setColumns([
      {
        title: 'Learner Name',
        key: 'StudentName',
        dataIndex: 'StudentName',
        width: 150,
        render: (_e, item) => {
          return `${item.FirstName || ''} ${item.LastName || ''}`;
        },
      },

      {
        title: 'DOB',
        dataIndex: 'DOB',
        key: 'DateOfBirth',
        width: 110,
        ellipsis: true,
        render: (e) => moment(e).format('DD/MM/YYYY'),
      },
      {
        title: 'Gender',
        dataIndex: 'Gender',
        key: 'Gender',
        width: 80,
      },
      {
        title: 'Ethnicity',
        dataIndex: 'Ethnicity',
        key: 'Ethnicity',
        ellipsis: true,
        width: 120,
      },
      {
        title: 'Email',
        dataIndex: 'Email',
        key: 'Email',
        ellipsis: true,
        width: 150,
      },
      {
        title: 'School Name',
        dataIndex: 'SchoolName',
        key: 'SchoolName',
        ellipsis: true,
        width: 150,
      },
      {
        title: 'Workshop Code',
        dataIndex: 'Code',
        key: 'Code',
        ellipsis: true,
        width: 150,
      },
      {
        title: 'Learner Status',
        dataIndex: 'Status',
        key: 'Status',
        width: 90,
        ellipsis: true,
        render: (e) => <span style={{ fontSize: '12px' }}>{e}</span>,
      },
      {
        title: 'Fees',
        dataIndex: 'Fees',
        key: 'Fees',
        width: 90,
        ellipsis: true,
        render: (e) => <span style={{ fontSize: '12px' }}>{e}</span>,
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

  const getList = (data = {}) => {
    setLoading(true);
    services.student
      .getWorkshopStudent({
        ...pagination,
        ...formParams,
        ...data,
        total: undefined,
      })
      .then((res) => {
        setData(res?.data || []);
        setPagination({ ...pagination, ...res?.pagination });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSubmit = (values) => {
    setAddLoading(true);
    let { SchoolName } = values;

    if (typeof SchoolName === 'number') {
      SchoolName = {
        label: rowData.SchoolName,
        value: values?.SchoolName,
      };
    } else if (typeof SchoolName?.value === 'string') {
      SchoolName = {
        label: SchoolName.value,
        value: 0,
      };
    }

    services.g
      .postWorkshopInfo({
        StudentID: rowData.StudentID,
        ...values,
        SchoolName: SchoolName?.label,
        SchoolNumber: SchoolName?.value,
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

  const handleDelete = (StudentID) => {
    services.g
      .deleteWorkshopInfo({
        StudentID,
      })
      .then((res) => {
        if (res?.data) {
          Message.success('success');
          getList();
        }
      });
  };

  const onChangeTable = (pagination) => {
    const { current, pageSize } = pagination;
    setPagination({ ...pagination, current, pageSize });
    getList({ current, pageSize });
  };

  function handleSearch(params) {
    setPagination({ ...pagination, current: 1 });
    setFormParams(params);
    getList({
      current: 1,
      ...params,
    });
  }

  const handleRowRender = (row) => {
    const infoData = [
      {
        label: 'Current Course:',
        value: row['CourseName'],
      },
      {
        label: 'Tutor:',
        value: row['Tutor'],
      },
      {
        label: 'PhoneNumber:',
        value: row['PhoneNumber'],
      },

      {
        label: 'WorkbookOption:',
        value: row['WorkbookOption'],
      },

      {
        label: 'Address:',
        value:
          !row.StreetAddress && !row.StreetAddress && !row.StreetAddress
            ? '-'
            : `${row.StreetAddress || ''}, ${row.City || ''}, ${
                row.Region || ''
              }`,
      },
      {
        label: 'Zipcode:',
        value: row['Zipcode'],
      },
      {
        label: 'TeacherName:',
        value: row['TeacherName'],
      },
      {
        label: 'TeacherEmail:',
        value: row['TeacherEmail'],
      },
      {
        label: 'InvoiceEmail:',
        value: row['InvoiceEmail'],
      },
      {
        label: 'AdditionalInfo:',
        value: row['AdditionalInfo'],
      },
    ];
    return (
      <>
        <Descriptions
          layout="inline-horizontal"
          border
          column={{
            xs: 1,
            sm: 2,
            md: 2,
            lg: 2,
            xl: 3,
            xxl: 4,
          }}
          data={infoData}
        />
        <Space>
          <Button
            type="primary"
            size="mini"
            onClick={(e) => {
              e.stopPropagation();
              setRow(row);
              setCoursesVisible(true);
            }}
          >
            Courses filled in on the forms
          </Button>
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
                <Button type="primary" size="mini">
                  Assign Course
                </Button>
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
                      options={tutorOption}
                      placeholder="please enter"
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
                    services.g.getTutor({}).then((res) => {
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

  const handleModalCancel = () =>{
    setVisible(false);
    form.resetFields();
  }

  return (
    <Card>
      <SearchForm onSearch={handleSearch} />
      <ResizableTable
        key={columnsKey}
        columns={columns}
        rowKey={'StudentID'}
        // expandedRowRender={handleRowRender}
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
          expandRowByClick: false,
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
      />
      <Modal
        title="Edit Workshop Learner"
        visible={visible}
        footer={null}
        onCancel={handleModalCancel}
        autoFocus={false}
        focusLock={true}
        unmountOnExit={true}
        style={{ width: '600px' }}
      >
        <AddForm
          isEdit={true}
          form={form}
          handleSubmit={handleSubmit}
          handleCancel={handleModalCancel}
          loading={addLoading}
        ></AddForm>
      </Modal>
    </Card>
  );
}

export default LearnerSearch;
