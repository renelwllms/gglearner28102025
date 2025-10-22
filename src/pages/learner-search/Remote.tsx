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
} from '@arco-design/web-react';
import * as services from '@/services';
import { useDispatch, useSelector } from 'react-redux';
import SearchForm from './form';
import Courses from './Courses';
import { IconDown, IconRight } from '@arco-design/web-react/icon';
import useForm from '@arco-design/web-react/es/Form/useForm';
import UpdateForm from './updateForm';
import ResizableTable from '@/components/ResizableTable';

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
          width: 150,
          render: (_e, item) => (
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
        render: (e) => moment(e).format('DD/MM/YYYY'),
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

  const setFormFieldsValue = (item) =>{
    form.setFieldsValue({
      ...item,
      FarmingUnitID: {"value" : item.FarmingUnitID,"label" : item.FarmingUnits},
      HospitalityCourseID: {"value" : item.HospitalityCourseID,"label" : item.HospitalityCourses},
      WorklifeCoursesID: {"value" : item.WorklifeCoursesID,"label" : item.WorklifeCourses}
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

  const getList = (data = {}) => {
    setLoading(true);
    services.student
      .getStudentList({
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
    const infoData = [
      {
        label: 'Farming Course:',
        value: row['FarmingUnits'],
      },
      {
        label: 'Hospitality Course:',
        value: row['HospitalityCourses'],
      },
      {
        label: 'Worklife Course:',
        value: row['WorklifeCourses'],
      },
      {
        label: 'Tutor:',
        value: row['Tutor'],
      },
      {
        label: 'Phone Number:',
        value: row['PhoneNumber'],
      },

      {
        label: 'Workbook Option:',
        value: row['WorkbookOption'],
      },

      {
        label: 'Address:',
        value:
          !row.StreetAddress && !row.StreetAddress && !row.StreetAddress
            ? '-'
            : `${row.StreetAddress || ''}, ${row.City || ''}, ${row.Region || ''
            }`,
      },
      {
        label: 'Zipcode:',
        value: row['Zipcode'],
      },
      {
        label: 'Teacher Name:',
        value: row['TeacherName'],
      },
      {
        label: 'Teacher Email:',
        value: row['TeacherEmail'],
      },
      {
        label: 'Invoice Email:',
        value: row['InvoiceEmail'],
      },
      {
        label: 'Additional Info:',
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

  const handleModalCancel = () => {
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
      />

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
        title="Edit Remote Learner"
        visible={visible}
        footer={null}
        onCancel={() => {
          setVisible(false);
          form.resetFields();
        }}
        autoFocus={false}
        focusLock={true}
        unmountOnExit={true}
        style={{ width: '70%' }}
      >
        <UpdateForm
          form={form}
          handleSubmit={handleSubmit}
          handleCancel={handleModalCancel}
          loading={addLoading}
          headerInfo = {rowData}
        ></UpdateForm>
      </Modal>
    </Card>
  );
}

export default LearnerSearch;
