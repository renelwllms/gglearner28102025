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
  Form,
  Input,
} from '@arco-design/web-react';
import * as services from '@/services';
import { useSelector } from 'react-redux';
import SearchForm from './form';
import Courses from './Courses';
import { IconDown, IconRight } from '@arco-design/web-react/icon';
import useForm from '@arco-design/web-react/es/Form/useForm';
//import UpdateForm from './updateForm';
import UpdateForm from './updateForm';
import ResizableTable from '@/components/ResizableTable';
import SendForm from './sendForm';

const options = ['Achieved', 'Merit', 'Excellence', 'Not Yet Achieved'];
function LearnerSearch() {

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const token = useSelector((state: any) => state.token);
  const [formParams, setFormParams] = useState({});
  const [pagination, setPagination] = useState({
    total: 0,
    pageSize: 10,
    current: 1,
  });
  const [coursesVisible, setCoursesVisible] = useState(false);
  const [rowData, setRow] = useState<any>({});
  const [courseOption, setCourse] = useState([]);
  const [courseVal, setCourseVal] = useState<any>({});
  const [form] = useForm();
  const [visible, setVisible] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [aForm] = useForm();
  const [cData, setCData] = useState<any>({});
  const [assessVisible, setAssessVisible] = useState(false);
  const [assessLoading, setAssessLoading] = useState(false);
  const [certificateVisible, setCertificateVisible] = useState(false);
  const [rVisible, setRVisible] = useState(false);
  const isAdmin = useSelector((state: any) => state.isAdmin);
  const userInfo = useSelector((state: any) => state.userInfo);
  //const { userInfo } = store.getState();

  useEffect(() => {
    if (token) {
      getList();
    }
  }, [token]);

  useEffect(() => {
    if (!rVisible || assessVisible) {
      setCData({});
    }
  }, [rVisible, assessVisible]);

  const setStudentCourse = (data) => {
    services.student.setStudentCourse(data).then((res) => {
      Message.success(res?.data);
      getList();
    });
  };

    const Operation = [
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
                  //setFormFieldsValue(item);
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
      ];

  const setFormFieldsValue = (item) =>{
    form.setFieldsValue({
      ...item,
      FarmingUnitID: {"value" : item.FarmingUnitID,"label" : item.FarmingUnits},
      HospitalityCourseID: {"value" : item.FarmingUnitID,"label" : item.HospitalityCourses},
      WorklifeCoursesID: {"value" : item.WorklifeCoursesID,"label" : item.WorklifeCourses}
    });
  }
  
  const columns: TableColumnProps[] = [
    {
      title: 'Learner Name',
      key: 'StudentName',
      dataIndex: 'StudentName',
      width: 180,
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
      width: 150,
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
      width: 180,
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
      title: 'Teacher',
      dataIndex: 'Tutor',
      key:"Tutor",
      ellipsis: !isAdmin,
      hideInTable:false,
    },
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
  ];

  const getList = (data = {}) => {
    setLoading(true);
    services.student
      .getMyStudent({
        ...pagination,
        ...formParams,
        ...data,
        total: undefined,
        Email:(isAdmin?'':userInfo.mail)
      })
      .then((res) => {
        setData(res?.data || []);
        setPagination({ ...pagination, ...res?.pagination });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getCodeUnits = (CourseID) => {
    services.g.getCourseUnits({ CourseID }).then((res) => {
      if (res.data) {
        setCData(res.data);
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

    services.g
      .postStudentInfo({
        StudentID: rowData.StudentID,
        ...values,
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

  const handleASubmit = (values) => {
    setAssessLoading(true);
    services.g
      .submitStudentResult({
        StudentID: rowData.StudentID,
        Result: values,
      })
      .then((res) => {
        if (res?.data) {
          setAssessVisible(false);
          Message.success('success');
          aForm.resetFields();
          getList();
        }
      })
      .finally(() => {
        setAssessLoading(false);
      });
  };

  const handleResultRender = (row) => {
    if (!row.Result) return 'Not yet assessed';
    if (!cData?.units || !cData?.course?.CourseName) return 'Loading';
    const d = JSON.parse(row.Result);
    const arr = cData?.units?.map((item) => {
      return {
        label: `${item.USName}:`,
        value: d[String(item.UnitStandardID)],
      };
    });
    const infoData = [
      {
        label: `${cData?.course?.CourseName} Full Course:`,
        value: d['Course'],
      },
      ...arr,
    ];
    return (
      <Descriptions
        layout="inline-horizontal"
        column={1}
        border
        data={infoData}
      />
    );
  };

  const handleRowRender = (row) => {
    const infoData = [
      {
        label: 'Current Course:',
        value: row['CourseName'],
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
                    onVisibleChange={(v) => {
                      if (v) {
                        services.g.getCourse({}).then((res) => {
                          setCourse(res?.data || []);
                        });
                      }
                    }}
                    onChange={(e) => {
                      setCourseVal(e);
                    }}
                  />
                </div>
              }
              okText="ok"
              cancelText="cancel"
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
          <Button
            type="primary"
            size="mini"
            onClick={(e) => {
              e.stopPropagation();
              if (!row.CourseID)
                return Message.warning('Please assign a course first');
              getCodeUnits(row.CourseID);
              setRow(row);
              setAssessVisible(true);
            }}
          >
            Assess
          </Button>
          <Button
            type="primary"
            size="mini"
            onClick={(e) => {
              e.stopPropagation();
              if (!row.Result) return Message.warning('Not yet assessed');
              const d = JSON.parse(row.Result);
              setRow(row);
              getCodeUnits(row.CourseID);
              setRVisible(true);
            }}
          >
            Result
          </Button>
          <Button
            type="primary"
            size="mini"
            onClick={(e) => {
              e.stopPropagation();
              if (
                row.Status === 'Did Not Complete' ||
                row.Status === 'Withdraws'
              ) {
                return Message.warning(row.Status);
              }
              if (!row.Result) return Message.warning('Not yet assessed');
              const d = JSON.parse(row.Result);
              if (!d?.Course || d?.Course === 'Not Yet Achieved') {
                return Message.warning('Not yet assessed');
              }
              setRow(row);
              setCertificateVisible(true);
            }}
          >
            Certificate
          </Button>
        </Space>
      </>
    );
  };

  return (
    <Card>
      <SearchForm onSearch={handleSearch} />
      <ResizableTable
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
        style={{ width: '600px' }}
      >
        <UpdateForm
          form={form}
          handleSubmit={handleSubmit}
          loading={addLoading}
        ></UpdateForm>
      </Modal>

      <Modal
        title="Generate Certificate"
        visible={certificateVisible}
        footer={null}
        onCancel={() => {
          setCertificateVisible(false);
        }}
        autoFocus={false}
        focusLock={true}
        unmountOnExit={true}
      >
        <SendForm
          rowData={rowData}
          ok={() => {
            setCertificateVisible(false);
          }}
        ></SendForm>
      </Modal>

      <Modal
        title="Result"
        visible={rVisible}
        footer={null}
        onCancel={() => {
          setRVisible(false);
        }}
        autoFocus={false}
        focusLock={true}
        unmountOnExit={true}
      >
        {handleResultRender(rowData)}
      </Modal>

      <Modal
        title="Assess"
        visible={assessVisible}
        footer={null}
        onCancel={() => {
          setAssessVisible(false);
          aForm.resetFields();
        }}
        autoFocus={false}
        focusLock={true}
        unmountOnExit={true}
        style={{ width: '500px' }}
      >
        <Form
          form={aForm}
          layout={'vertical'}
          labelAlign="left"
          wrapperCol={{ span: 24 }}
          onSubmit={handleASubmit}
        >
          <Form.Item label={'Learner Name'}>
            <Input
              defaultValue={`${rowData?.FirstName || ''} ${
                rowData?.LastName || ''
              }`}
              style={{ width: '100%' }}
              disabled
              placeholder="please enter"
            />
          </Form.Item>
          <Form.Item
            label={`${cData?.course?.CourseName} Full Course`}
            field={'Course'}
            rules={[{ required: true, message: 'required' }]}
          >
            <Select allowClear options={options} placeholder="please enter" />
          </Form.Item>
          {cData?.units?.map((item) => {
            return (
              <Form.Item
                key={item.UnitStandardID}
                label={item.USName}
                field={String(item.UnitStandardID)}
                rules={[{ required: true, message: 'required' }]}
              >
                <Select
                  allowClear
                  options={options}
                  placeholder="please enter"
                />
              </Form.Item>
            );
          })}

          <Form.Item style={{ textAlign: 'center' }}>
            <Space>
              <Button loading={assessLoading} type="primary" htmlType="submit">
                {'Submit'}
              </Button>
              <Button
                onClick={() => {
                  aForm.resetFields();
                }}
              >
                {'Reset'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

export default LearnerSearch;
