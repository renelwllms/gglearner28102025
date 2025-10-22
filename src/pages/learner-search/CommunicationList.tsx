import {
  Descriptions,
  Form,
  Input,
  Message,
  Popconfirm,
  Select,
  Space,
  Spin,
  Grid,
  Table,
  Upload,
  Tabs, Card, Typography, Modal, Button, DatePicker, TimePicker
} from '@arco-design/web-react';
import { IconEdit, IconPlus, IconRefresh, IconUpload, IconSearch } from '@arco-design/web-react/icon';
import React, { useEffect, useMemo, useState } from 'react';
import useForm from '@arco-design/web-react/es/Form/useForm';
import { commService } from '@/services/communication';
import { useDispatch, useSelector } from 'react-redux';
import ResizableTable from '@/components/ResizableTable';
import styles from './index.module.less';
import moment from 'moment';
import * as services from '@/services';

const { Paragraph, Text } = Typography;
function CommunicationList({ StudentID, LearnerName, Email, studentInfo }) {
  const [visibleComm, setVisibleComm] = useState(false);
  const [id, setId] = useState(0);
  const [assessLoading, setAssessLoading] = useState(false);
  const [communications, setCommunications] = useState([]);
  const [visibleLastCommDate, setVisibleLastCommDate] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [subOptions, setSubOptions] = useState([]);
  const [subOption, setSubOption] = useState({});
  const [studentCourse, setStudentCourse] = useState([]);
  const [courseName, setCourseName] = useState("");
  const [lastCommDateValue, setLastCommDate] = useState("");
  const [attachment, setAttachment] = useState(null);
  // const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const isAdmin = useSelector((state: any) => state.isAdmin);
  const token = useSelector((state: any) => state.token);
  const [aForm] = useForm();
  const [aLastCommForm] = useForm();
  const { Row, Col } = Grid;
  const [form] = useForm();
  const [fileList, setFileList] = useState([]);

  const [pagination, setPagination] = useState({
    total: 0,
    pageSize: 10,
    current: 1,
  });

  useEffect(() => {
    if (token) {
      fetchTemplates();
      getStudentCourseList();
      fetchCommunication();
      setLastCommDate(studentInfo.LastCommunicateDate);
      form.setFieldsValue({"lastCommDate":studentInfo.LastCommunicateDate});
      aLastCommForm.setFieldsValue({"lastCommDate":studentInfo.LastCommunicateDate});
      console.log(studentInfo);
    }
  }, [token]);

  const fetchTemplates = (data = {}) => {
    setLoading(true);
    commService
      .getTemplateList(data)
      .then((res) => {
        setSubOptions(res?.data || []);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchCommunication = (data = {}) => {
    setLoading(true);
    commService
      .getList({ StudentId: StudentID, ...data })
      .then((res) => {
        setCommunications(res?.data || []);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleAdd = () => {
    setId(0);
    setCourseName('');
    setVisibleComm(true);
  };


  const handleChangeLastCommDate = () => {
    setVisibleLastCommDate(true);
  };

  const handleEdit = (comData) => {
    setId(comData.Id);
    console.log("comData");
    console.log(comData);
    aForm.setFieldValue("CommunicationType", comData.CommunicationType);
    aForm.setFieldValue("SubType", comData.SubType);
    aForm.setFieldValue("CommDate", comData.CommDate);
    aForm.setFieldValue("CommTime", comData.CommTime);
    aForm.setFieldValue("Message", comData.Message);
    aForm.setFieldValue("Attachments", comData.Attachments);
    setVisibleComm(true);
  };

  const handleCancel = () => {
    aForm.resetFields();
    setAssessLoading(false);
    setVisibleComm(false);
  }

  const options = ['Email', 'Phone', 'SMS', 'Custom'];

  const handleSubmit = (values) => {
    console.log("Abcd");
    console.log(values?.SubType);
    console.log("fileList");
    console.log(fileList);
    var attch = fileList.length > 0 ? fileList[0].originFile : null;

    console.log("attch");
    console.log(fileList.length);
    console.log(attch);
    // var data = {
    //   id: id,
    //   StudentId: StudentID,
    //   CommunicationType: values?.CommunicationType,
    //   SubType: values?.SubType?.value || '',
    //   SubTypeName: values?.SubType?.label || '',
    //   CommDate: values?.CommDate || '',
    //   CommTime: values?.CommTime || '',
    //   Message: values?.Message || '',
    //   Email: Email || '', 
    //   ...(attch && { AttachFile: attch }) 
    // };

    const formData = new FormData();
    formData.append('StudentId', StudentID);
    formData.append('CommunicationType', values?.CommunicationType);
    formData.append('SubType', values?.SubType?.value || '');
    formData.append('SubTypeName', values?.SubType?.label || '');
    formData.append('Subject', subOption["Subject"] || '');
    formData.append('CommDate', values?.CommDate || '');
    formData.append('CommTime', values?.CommTime || '');
    formData.append('Message', values?.Message || '');
    formData.append('Email', Email || '');

    if (attch) {
      formData.append('AttachFile', attch); // key must match backend multer field name
    }


    if (id > 0) {
      commService.UpdateComm({
        id: id,
        ...formData
      })
        .then((res) => {
          if (res?.data) {
            setVisibleComm(false);
            Message.success('success');
            aForm.resetFields();
            fetchCommunication();
          }
        })
        .finally(() => {
          setAssessLoading(false);
        });
    }
    else {
      commService.AddComm(formData)
        .then((res) => {
          if (res?.data) {
            Message.success('success');
            setVisibleComm(false);
            aForm.resetFields();
            fetchCommunication();
          }
        })
        .finally(() => {
          setAssessLoading(false);
        });
    }
  };


  const handleOnSubmitLastCommDate = (values) => {
    console.log("Abcd");
    const formData = {"StudentId": StudentID, "CommDate":values?.lastCommDate }
    
    if (StudentID > 0) {
      commService.UpdateLastCommDate({
        id: StudentID,
        ...formData
      })
        .then((res) => {
          if (res?.data) {
            Message.success('success');
            setLastCommDate(values?.lastCommDate);
            form.setFieldsValue({"lastCommDate":values?.lastCommDate});
            setVisibleLastCommDate(false);
          }
        })
        .finally(() => {
          setAssessLoading(false);
        });
    }
  };

  const operation = isAdmin
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
                console.log("abcd");
                e.stopPropagation();
                handleEdit(item);
              }}
            >
              View
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
                  handleDelete(item.Id);
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

  const columns = [
    {
      title: 'Type',
      dataIndex: 'CommunicationType',
      key: 'CommunicationType',
      width: 85,
    },
    {
      title: 'Template Name',
      dataIndex: 'SubTypeName',
      key: 'SubTypeName',
      ellipsis: true,
      width: 110,
    },
    {
      title: 'Message',
      dataIndex: 'Message',
      key: 'Message',
      ellipsis: true,
      width: 120,
    },
    {
      title: 'Date',
      dataIndex: 'CommDate',
      key: 'CommDate',
      width: 120,
      ellipsis: true,
      render: (e) => moment(e).format('DD/MM/YYYY'),
    },
    {
      title: 'Time',
      dataIndex: 'CommTime',
      key: 'CommTime',
      ellipsis: true,
      width: 160,
    },
    ...operation,
  ];

  const onChangeTable = (pagination) => {
    const { current, pageSize } = pagination;
    setPagination({ ...pagination, current, pageSize });
    fetchCommunication({ current, pageSize });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearchSubmit();
    }
  }

  const handleSearchSubmit = () => {
    const values = form.getFieldsValue();
    fetchCommunication(values);
  };

  const handleDelete = (id) => {
    commService.deleteCommunication({
      id,
    })
      .then((res) => {
        if (res?.data) {
          Message.success('success');
          fetchCommunication();
        }
      });
  };

  const getStudentCourseList = (data = {}) => {
    setLoading(true);
    services.student
      .getAllCourses({
        id: StudentID
      })
      .then((res) => {
        setStudentCourse(res?.data || []);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  let messageText = "";
  let coursename = "";
  const setMessage = () => {
    var msg = messageText;
    console.log("setMessage");

    // Replace learner name if available
    if (LearnerName) {
      console.log("Con 01");
      msg = msg.replace(/{LearnerName}/g, LearnerName);
      console.log(msg);
    }

    // Replace course name if selected, otherwise remove the placeholder
    if (coursename) {
      console.log("Con 02");
      msg = msg.replace(/{CourseName}/g, coursename);
    } else {
      // Remove {CourseName} placeholder if no course is selected
      msg = msg.replace(/{CourseName}/g, '');
    }

    aForm.setFieldValue("Message", msg);
  }

  const handleTypeChange = (value) => {
    if (value === "Email") {
      setSelectedType(1);
    }
    else {
      setSelectedType(2);
    }
    setSubOption({});
    console.log(value);
  };

  const handleSubTypeChange = (e) => {
    var fObjs = subOptions.filter(x => x.id == e.value);
    if (fObjs.length > 0) {
      messageText = fObjs[0].Template;
      setMessage();
    }
    console.log('handleSubTypeChange');
    console.log(e);
  };

  const handleCourseChange = (e) => {
    // If user selects "None" (value 0) or clears the selection, don't set a course name
    if (!e || e === 0) {
      coursename = "";
      setMessage();
      return;
    }

    var fObjs = studentCourse.filter(x => x.Id == e);
    console.log("Selected Course");
    console.log(e);
    console.log(studentCourse);
    console.log(fObjs);
    if (fObjs.length > 0) {
      coursename = fObjs[0].CourseName;
      setMessage();
    } else {
      coursename = "";
      setMessage();
    }
    console.log(e);
  };


  const handleUploader = (file) => {
    console.log("file", file);
    setAttachment(file);

  }
  const handleChange = (info) => {
    console.log(info);
    setFileList(info);
  };

  const handleRemove = (file) => {
    setFileList((prevList) => prevList.filter((item) => item.uid !== file.uid));
    Message.info(`${file.name} removed`);
  };


  return (
    <Spin loading={loading} block>
      <div style={{ padding: 20 }}>
        <div>
          <Form
            form={form}
            className={styles['search-form']}
            labelAlign="left"
            layout="inline"
            style={{
              display: 'inline-block',
              marginBottom: '10px',
            }}
          >
            <Row>
              <Form.Item label={'Search'} field="Search">
                <Input allowClear onKeyDown={handleKeyDown} placeholder={'Please enter keyword'} />
              </Form.Item>
              <Space>
                <Button type="primary" icon={<IconSearch />} onClick={handleSearchSubmit}>
                  {'Search'}
                </Button>
              </Space>

              <div
                style={{
                  position: 'absolute',
                  right: '130px',
                  display: 'inline-block',
                }}
              >

                <Space>

                  {/* <Form.Item label={'Last Comm Date'} field="lastCommDate">
                    <DatePicker format={(value) => `${value.format('DD/MM/YYYY')}`} style={{ width: '100%' }} />
                  </Form.Item>
                  <Button
                    type="primary"
                    onClick={handleChangeLastCommDate}
                    style={{ marginRight: '10px', marginLeft: '10px' }}
                  >
                    {'Change'}
                  </Button> */}
                  <Button
                    type="primary"
                    onClick={handleAdd}
                    style={{ marginRight: '10px', marginLeft: '10px' }}
                  >
                    {'Add'}
                  </Button>
                </Space>
              </div>
            </Row>
          </Form>

        </div>
        <Table
          rowKey={'Id'}
          columns={columns}
          data={communications}
          loading={loading}
        />
      </div>
      <Modal
        title={id > 0 ? `Edit Comminucation` : `Add Comminucation`}
        visible={visibleComm}
        footer={null}
        onCancel={() => {
          setVisibleComm(false);
        }}
        autoFocus={false}
        focusLock={true}
        unmountOnExit={true}
        style={{ width: '30%' }}
      >  <Form
        form={aForm}
        layout={'vertical'}
        labelAlign="left"
        wrapperCol={{ span: 24 }}
        onSubmit={handleSubmit}
      >
          <Form.Item label={'Learner Name'}
            field={'LearnerName'}>
            <Input
              defaultValue={`${LearnerName || ''}`}
              style={{ width: '100%' }}
              disabled
              placeholder={LearnerName}
            />
          </Form.Item>
          <Form.Item label={'Email'}
            field={'Email'}>
            <Input
              defaultValue={`${Email || ''}`}
              style={{ width: '100%' }}
              disabled
              placeholder={Email}
            />
          </Form.Item>
          <Form.Item
            label={`Communication Type`}
            field={'CommunicationType'}
            style={{ width: '70%' }}
            rules={[{ required: false, message: 'required' }]}
          >
            <Select allowClear options={options} placeholder="please enter"
              onChange={(e) => {
                handleTypeChange(e);
              }} />
          </Form.Item>
          {(selectedType == 1) && (<Form.Item
            label={`Email Template`}
            field={'SubType'}
            style={{ width: '60%' }}
            rules={[{ required: true, message: 'required' }]}
          >
            <Select
              labelInValue
              showSearch
              allowClear
              options={subOptions.map((it) => ({
                label: it.Name,
                value: it.id,
              }))}
              placeholder="please enter"
              onChange={(e) => {
                console.log(e);
                handleSubTypeChange(e);
              }} />
          </Form.Item>)}

          <Form.Item
            label={'Course (Optional)'}
            field="Courses"
            extra={studentCourse.length > 0
              ? `This student is enrolled in ${studentCourse.length} course${studentCourse.length > 1 ? 's' : ''}. Select one to include course name in the message.`
              : 'This student has no enrolled courses.'}
          >
            <Select
              allowClear
              options={[
                { label: '-- None (Send without course name) --', value: 0 },
                ...studentCourse.map((it) => ({
                  label: it.CourseName,
                  value: it.Id,
                }))
              ]}
              onChange={(e) => {
                handleCourseChange(e);
              }}
              placeholder="Select a course or leave blank"
            />
          </Form.Item>
          <Form.Item
            label={'Message'}
            field="Message"
          >
            <Input.TextArea
              allowClear
              style={{ width: '100%' }}
              placeholder="please enter"
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </Form.Item>

          {(id != 0) && (
            <Form.Item
              label={'Attachments'}
              field="Attachments"
            >
              <Input
                allowClear
                style={{ width: '100%' }}
                placeholder="please enter"
              />
            </Form.Item>
          )}


          {(id == 0) && (

            <Form.Item>
              <Upload
                fileList={fileList}
                onChange={handleChange}
                onRemove={handleRemove}
                showUploadList
                limit={1}
              >
                <Button icon={<IconUpload />}>Click to Upload</Button>
              </Upload>
            </Form.Item>
          )}


          <Form.Item style={{ textAlign: 'center' }}>
            <Space>
              {(id == 0) && (<Button
                loading={assessLoading}
                type="primary"
                htmlType="submit"
              >
                {'Save'}
              </Button>)}

              <Button onClick={handleCancel}>
                {'Cancel'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Change Last Comminucation  Date`}
        visible={visibleLastCommDate}
        footer={null}
        onCancel={() => {
          setVisibleLastCommDate(false);
        }}
        autoFocus={false}
        focusLock={true}
        unmountOnExit={true}
        style={{ width: '30%' }}
      >  <Form
        form={aLastCommForm}
        layout={'vertical'}
        labelAlign="left"
        wrapperCol={{ span: 24 }}
        onSubmit={handleOnSubmitLastCommDate}
      >
          <Form.Item label={'Learner Name'}
            field={'LearnerName'}>
            <Input
              defaultValue={`${LearnerName || ''}`}
              style={{ width: '100%' }}
              disabled
              placeholder={LearnerName}
            />
          </Form.Item>

          <Form.Item aria-readonly label={'Last Comm Date'} field="lastCommDate">
            <DatePicker format={(value) => `${value.format('DD/MM/YYYY')}`} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item style={{ textAlign: 'center' }}>
            <Space>
              {(id == 0) && (<Button
                loading={assessLoading}
                type="primary"
                htmlType="submit"
              >
                {'Save'}
              </Button>)}

              <Button onClick={() => {setVisibleLastCommDate(false);}}>
                {'Cancel'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}

export default CommunicationList;