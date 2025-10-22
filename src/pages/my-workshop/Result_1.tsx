import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Descriptions,
  Form,
  Input,
  Message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Tabs,
} from '@arco-design/web-react';
const FormItem = Form.Item;
import * as services from '@/services';
import moment from 'moment';
const TabPane = Tabs.TabPane;
import styles from './index.module.less';
import AddForm from '../Learner/form';
import useForm from '@arco-design/web-react/es/Form/useForm';
import { IconDown, IconRight } from '@arco-design/web-react/icon';
import SendForm from './sendForm';
import ResizableTable from '@/components/ResizableTable';
import UpdateForm from '../learner-search/updateForm';

const Option = Select.Option;
const options = ['Achieved', 'Partially Completed', 'Merit', 'Excellence', 'Not Yet Achieved'];
const stdStatuOptions = ['Ongoing', 'Completed', 'Withdrawn'];
function Result({ Code }: any) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [cData, setCData] = useState<any>({});
  const [assessAllData, setAssessAllData] = useState<any>({});
  const [form] = useForm();
  const [aForm] = useForm();
  const [assessAllForm] = useForm();
  const [unitStanderdForm] = useForm();
  const [uform] = useForm();
  const [addVisible, setAddVisible] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [assessVisible, setAssessVisible] = useState(false);
  const [assessAllVisible, setAssessAllVisible] = useState(false);
  const [unitStanderdVisible, setUnitStanderdVisible] = useState(false);
  const [assessLoading, setAssessLoading] = useState(false);
  const [unitStanderdLoading, setUnitStanderdLoading] = useState(false);
  const [rowData, setRow] = useState<any>({});
  const [certificateVisible, setCertificateVisible] = useState(false);
  const [isAll, setAll] = useState(false);
  const [visible, setVisible] = useState(false);
  const [courseUnits, setCourseUnits] = useState<any>([]);
  const [unitStandards, setUnitStandards] = useState([]);

  const columns: any = [
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
      dataIndex: 'DateOfBirth',
      key: 'DateOfBirth',
      width: 100,
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
      width: 100,
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
      title: 'Course Status',
      dataIndex: 'CourseStatus',
      key: 'CourseStatus',
      width: 105,
      render: (e) => <span style={{ fontSize: '12px' }}>{e}</span>,
    },
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
              setAssessData(item);
              setRow(item);
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
              /*if (
                item.Status === 'Did Not Complete' ||
                item.Status === 'Withdraws'
              ) {
                return Message.warning(item.Status);
              }*/
              if (!item.Result) return Message.warning('Not yet assessed');
              /*const d = JSON.parse(item.Result);
              if (!d?.Course || d?.Course === 'Not Yet Achieved') {
                return Message.warning('Not yet achieved');
              }*/
              if (!item.CourseStatus || item.CourseStatus === 'Not Yet Achieved') {
                return Message.warning('Not yet achieved');
              }
              setAll(false);
              setRow(item);
              setCertificateVisible(true);
            }}
          >
            Certificate
          </Button>
          <Button
            type="primary"
            size="mini"
            onClick={(e) => {
              e.stopPropagation();
              setRow(item);
              uform.setFieldsValue({
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
      width: 220,
    },
  ];

  useEffect(() => {
    getList();
    getCodeUnits();
    fetchUnits();
  }, [Code]);

  let varUnitStanderd = [];
  useEffect(() => {
    varUnitStanderd = unitStandards;
  }, [unitStandards]);

  const setAssessData = (data) => {
    var availableUnits = [];
    if (data?.Result) {
      var reslutObj = JSON.parse(data.Result);
      const keysArray = Object.keys(reslutObj);
      console.log(keysArray);
      services.course.getUnits(data).then((res) => {
        var unitStandrds = res?.data || [];

        for (let i = 0; i < keysArray.length; i++) {
          var filterOpt = unitStandrds.filter((opt) => opt.UnitStandardID == parseInt(keysArray[i]));
          if (filterOpt.length > 0) {
            availableUnits.push({ ...filterOpt[0], UnitStandard: filterOpt[0].US });
          }
        }
        setCData(prev => ({ ...prev, units: availableUnits }));
      });
    }
    aForm.setFieldsValue(JSON.parse(data?.Result));
  }

  const fetchUnits = (data = {}) => {
    services.course.getUnits(data).then((res) => {
      setUnitStandards(res?.data || []);
    });
  };

  const getList = () => {
    setLoading(true);
    services.g
      .getWorkshopResult({ Code })
      .then((res) => {
        if (res.data) {
          setData(res.data);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getCodeUnits = () => {
    services.g.getCodeUnits({ Code }).then((res) => {
      if (res.data) {
        setCData(res.data);
        setAssessAllData(res.data);
      }
    });
  };

  const handleSubmit = (values) => {
    setAddLoading(true);
    const { FirstName, LastName, SchoolName, Gender, DOB, Email, Ethnicity } =
      values;

    services.g
      .addWorkshopInfoExtra({
        Code,
        FirstName,
        LastName,
        SchoolName: SchoolName?.label,
        SchoolNumber: SchoolName?.value,
        Gender,
        DOB,
        Email,
        Ethnicity,
      })
      .then((res) => {
        if (res?.data) {
          setAddVisible(false);
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
      .submitResult({
        StudentID: rowData?.StudentID,
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

  const handleEditSubmit = (values) => {
    
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
/*
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
*/
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

  const handleAddCancel = () => {
    setAddVisible(false);
    form.resetFields();
  }

  const handleEditCancel = () => {
    setVisible(false);
    uform.resetFields();
  }

  const handleAssessCancel = () => {
    setAssessVisible(false);
    aForm.resetFields();
  }

  const handleAssessAllVisible = () => {
    setAssessAllVisible(false);
  }

  const assessAllVisibleHandle = (visible) => {
    setAssessAllVisible(visible);
  }

  const handleUnitStanderdVisible = () => {
    setUnitStanderdVisible(false);
  }

  const ShowUnitStanderdVisible = (visible) => {
    console.log(unitStandards);
    setUnitStanderdVisible(visible);
  }

  const handleAssesAllSubmit = (values) => {
    setAssessLoading(true);
    services.g
      .submitAllResult({
        Code: Code,
        Result: values,
      })
      .then((res) => {
        if (res?.data) {
          setAssessAllVisible(false);
          Message.success('success');
          assessAllForm.resetFields();
          getList();
        }
      })
      .finally(() => {
        setAssessLoading(false);
      });

  };

  const handleAddUnitStanderdSubmit = (values) => {
    setUnitStanderdLoading(true);
    var availableUnits = cData?.units;
    values?.UnitStandardIDs?.forEach(unitStanderdId => {
      console.log(unitStanderdId);
      var filterOpt = unitStandards.filter((opt) => opt.UnitStandardID == unitStanderdId);
      if (filterOpt.length > 0) {
        availableUnits.push({ ...filterOpt[0], UnitStandard: filterOpt[0].US });
      }
    });
    setUnitStanderdVisible(false);
    setUnitStanderdLoading(false);
  };

  const handleRowRender = (row) => {
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

  return (
    <Spin loading={loading} block>
      <div
        className={styles['workshop-result']}
        style={{
          height: 500,
          width: '100%',
          visibility: !loading ? 'visible' : 'hidden',
        }}
      >
        <div style={{ textAlign: 'right', marginBottom: '10px' }}>
          <Space>
            <Button
              type="primary"
              size="mini"
              onClick={() => {
                setAddVisible(true);
              }}
            >
              {'Add'}
            </Button>
            <Button
              type="primary"
              size="mini"
              onClick={(e) => {
                e.stopPropagation();
                setAll(true);
                setCertificateVisible(true);
              }}
            >
              Generate all certificates
            </Button>
            <Button
              type="primary"
              size="mini"
              onClick={(e) => {
                e.stopPropagation();
                setAll(true);
                assessAllVisibleHandle(true);
              }}
            >
              Assess all
            </Button>
          </Space>
        </div>

        <div>
          <ResizableTable
            rowKey={'StudentID'}
            rowClassName={(row) => (row?.isAdd ? styles['is-add'] : '')}
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
            columns={columns}
            data={data}
            loading={loading}
            scroll={{
              y: 450,
            }}
            border={{
              wrapper: true,
              cell: true,
            }}
            pagination={false}
          />
        </div>

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
            Code={Code}
            isAll={isAll}
            rowData={rowData}
            ok={() => {
              setCertificateVisible(false);
            }}
          ></SendForm>
        </Modal>
        <Modal
          title="Add"
          visible={addVisible}
          footer={null}
          onCancel={handleAddCancel}
          autoFocus={false}
          focusLock={true}
          unmountOnExit={true}
          style={{ width: '800px' }}
        >
          <AddForm
            form={form}
            handleSubmit={handleSubmit}
            loading={addLoading}
            handleCancel={handleAddCancel}
          ></AddForm>
        </Modal>

        <Modal
          title="Edit workshop Learner"
          visible={visible}
          footer={null}
          onCancel={handleEditCancel}
          autoFocus={false}
          focusLock={true}
          unmountOnExit={true}
          style={{ width: '70%' }}
        >
          {/* <AddForm
            isEdit={true}
            form={uform}
            handleSubmit={handleEditSubmit}
            loading={addLoading}
            handleCancel={handleEditCancel}
          ></AddForm>
           */}
        <UpdateForm
          form={uform}
          handleSubmit={handleEditSubmit}
          handleCancel={handleEditCancel}
          loading={addLoading}
          headerInfo = {rowData}
        ></UpdateForm>
        </Modal>
        <Modal
          title="Assess"
          visible={assessVisible}
          footer={null}
          onCancel={handleAssessCancel}
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
                defaultValue={`${rowData?.FirstName || ''} ${rowData?.LastName || ''
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
              <Select allowClear options={options} placeholder="please enter"
                onChange={(e) => {
                  let fdata = {};
                  cData?.units?.forEach(itm => {
                    var varibleName = "" + String(itm.UnitStandardID) + "";
                    fdata[varibleName] = e;
                  });

                  aForm.setFieldsValue(fdata);
                }} />
            </Form.Item>
            {cData?.units?.map((item) => {
              return (
                <Form.Item
                  key={item.UnitStandardID}
                  label={`${item.UnitStandard} - ${item.USName}`}
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
            
            <Form.Item
              label={'Note'}
              field="Note"
            >
              <Input.TextArea
                allowClear
                style={{ width: '100%' }}
                placeholder="please enter"
                autoSize={{ minRows: 3, maxRows: 6 }}
              />
            </Form.Item>

            <Form.Item style={{ textAlign: 'center' }}>
              <Space>
                <Button
                  loading={assessLoading}
                  type="primary"
                  onClick={() => { ShowUnitStanderdVisible(true); }}
                >
                  {'Unit Standard'}
                </Button>
                <Button
                  loading={assessLoading}
                  type="primary"
                  htmlType="submit"
                >
                  {'Submit'}
                </Button>
                <Button
                  onClick={handleAssessCancel}
                >
                  {'Cancel'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="Assess All"
          visible={assessAllVisible}
          footer={null}
          onCancel={handleAssessAllVisible}
          autoFocus={false}
          focusLock={true}
          unmountOnExit={true}
          style={{ width: '500px' }}
        >
          <Form
            form={assessAllForm}
            layout={'vertical'}
            labelAlign="left"
            wrapperCol={{ span: 24 }}
            onSubmit={handleAssesAllSubmit}
          >
            <Form.Item
              label={`${assessAllData?.course?.CourseName} Full Course`}
              field={'Course'}
              rules={[{ required: true, message: 'required' }]}
            >
              <Select allowClear options={options} placeholder="please enter"
                onChange={(e) => {
                  let fdata = {};
                  cData?.units?.forEach(itm => {
                    var varibleName = "" + String(itm.UnitStandardID) + "";
                    fdata[varibleName] = e;
                  });

                  assessAllForm.setFieldsValue(fdata);
                }} />
            </Form.Item>
            {assessAllData?.units?.map((item) => {
              return (
                <Form.Item
                  key={item.UnitStandardID}
                  label={`${item.UnitStandard} - ${item.USName}`}
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
                <Button
                  loading={assessLoading}
                  type="primary"
                  htmlType="submit"
                >
                  {'Submit'}
                </Button>
                <Button
                  onClick={handleAssessAllVisible}
                >
                  {'Cancel'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="Unit Standard"
          visible={unitStanderdVisible}
          footer={null}
          onCancel={handleUnitStanderdVisible}
          autoFocus={false}
          focusLock={true}
          unmountOnExit={true}
          style={{ width: '500px' }}
        >
          <Form
            form={unitStanderdForm}
            layout={'vertical'}
            labelAlign="left"
            wrapperCol={{ span: 24 }}
            onSubmit={handleAddUnitStanderdSubmit}
          >
            <FormItem label="Unit Standards" field="UnitStandardIDs">
              <Select
                mode="multiple"
                placeholder="Select unit standards"
                allowClear
                showSearch
              >
                {unitStandards.map((us) => (
                  <Option key={us.UnitStandardID} value={us.UnitStandardID}>
                    {us.US} - {us.USName}
                  </Option>
                ))}
              </Select>
            </FormItem>
            <Form.Item style={{ textAlign: 'center' }}>
              <Space>
                <Button
                  loading={unitStanderdLoading}
                  type="primary"
                  htmlType="submit"
                >
                  {'Submit'}
                </Button>
                <Button
                  onClick={handleUnitStanderdVisible}
                >
                  {'Cancel'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Spin>
  );
}

export default Result;
