import React, { useContext, useEffect, useState } from 'react';
import {
  Form,
  Checkbox,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Upload,
  List, Avatar, Card, Typography, Tabs
} from '@arco-design/web-react';

import * as services from '@/services';
import styles from './index.module.less';
import { Grid } from '@arco-design/web-react'
import { teacher } from '@/services/teacher';
import Courses from '../StudentCourses/Courses';
import CommunicationList from './CommunicationList'

import { IconEdit, IconDelete, IconDownload, IconPlus } from '@arco-design/web-react/icon';
const Row = Grid.Row
const Col = Grid.Col
const TabPane = Tabs.TabPane;

function UpdateForm({ handleSubmit, loading, form, handleCancel = null, headerInfo = null }: any) {
  const handleReset = () => {
    form.resetFields();
  };
  useEffect(() => {
    getOptions();
    fetchImages();
    fetchTeacherLists();
  }, []);
  const [schoolOption, setSchoolOption] = useState([]);
  const [courseOption, setCourse] = useState([]);
  const [ImageList, setImageList] = useState([]);
  const [farmingCourseVal, setFarmingCourseVal] = useState<any>({});
  const [hospitalityCourseVal, setHospitalityCourseVal] = useState<any>({});
  const [worklifeCourseVal, setWorklifeCourseVal] = useState<any>({});
  const [teacherList, setTeacherList] = useState([]);

  const fetchImages = () => {
    services.student.getStudentImageList({ StudentID: headerInfo.StudentID }).then((res) => {
      if (res?.data.length > 0) {
        const dataR = JSON.parse(res?.data[0]["AdditionalDocuments"]);
        setImageList(dataR || []);
      }
    });
  };

  const getOptions = () => {
    services.g.getCourse({}).then((res) => {
      setCourse(res?.data || []);
    });
    services.g.getSchool({}).then((res) => {
      setSchoolOption(res?.data || []);
    });

    services.g.getCourse({}).then((res) => {
      setCourse(res?.data || []);
    });
  };

  const fetchTeacherLists = async (data = {}) => {
    teacher.getAll(data)
      .then((res) => {
        setTeacherList(res?.data || []);
      })
      .finally(() => {
      });
  };

  const handleUploader = (file) => {
    const formData = new FormData();
    console.log("file", file);
    formData.append("file", file);
    formData.append("StudentID", headerInfo.StudentID);

    console.log(headerInfo.AdditionalDocuments || []);
    formData.append("ImageList", JSON.stringify(ImageList));
    formData.append("FileName", file.name);

    services.g.addDocument(formData).then((res) => {
      fetchImages();
    })
  }

  const downloadHandler = (item) => {
    const imgUrl = `/api/images/${item.FileSaveName}`;
    const link = document.createElement("a");
    link.href = imgUrl;
    link.download = item.FileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const deleteHandler = (item) => {
    var fImageList = ImageList.filter((itm) => itm.FileSaveName !== item.FileSaveName);
    services.g.deleteDocument({
      StudentID: headerInfo.StudentID,
      fileName: item.FileSaveName,
      ImageList: JSON.stringify(fImageList),
    }).then((res) => {
      fetchImages();
    })
  }
  return (
    <div style={{ width: '100%' }}>
      <Card>
        <Tabs defaultActiveTab="1" destroyOnHide>
          <TabPane key="1" title="Personal">
            <Form
              form={form}
              className={styles['search-form']}
              labelAlign="left"
              wrapperCol={{ span: 24 }}
              initialValues={{ type: 1 }}
              onSubmit={handleSubmit}
            >
              <Row gutter={12}>
                <Col span={11} >
                  <Form.Item field="type" hidden><Input /></Form.Item>
                  <Form.Item
                    label={'Learner First Name'}
                    field="FirstName"
                    rules={[{ required: true, message: 'required' }]}
                  >
                    <Input
                      allowClear
                      style={{ width: '100%' }}
                      placeholder="please enter"
                    />
                  </Form.Item>
                  <Form.Item
                    label={'Learner Last Name'}
                    field="LastName"
                    rules={[{ required: true, message: 'required' }]}
                  >
                    <Input
                      allowClear
                      style={{ width: '100%' }}
                      placeholder="please enter"
                    />
                  </Form.Item>
                  <Form.Item
                    label={'Date of Birth'}
                    field="DateOfBirth"
                    rules={[{ required: true, message: 'required' }]}
                  >
                    <DatePicker format={(value) => `${value.format('DD/MM/YYYY')}`} style={{ width: '100%' }} />
                  </Form.Item>

                  <Form.Item
                    label={'Gender'}
                    field="Gender"
                    rules={[{ required: true, message: 'required' }]}
                  >
                    <Select
                      allowClear
                      options={['Male', 'Female', 'Other']}
                      placeholder="please enter"
                    />
                  </Form.Item>

                  <Form.Item
                    label={'Ethnicity'}
                    field="Ethnicity"
                    rules={[{ required: true, message: 'required' }]}
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
                      placeholder="please select (If the option does not exist, you can enter it manually)"
                    />
                  </Form.Item>
                  <Form.Item
                    label={'Email'}
                    field="Email"
                    rules={[{ required: true, message: 'required' }]}
                  >
                    <Input
                      allowClear
                      style={{ width: '100%' }}
                      placeholder="please enter"
                    />
                  </Form.Item>
                  
                  <Form.Item
                    label={'NSN'}
                    field="NSN"
                  >
                  <Input
                    allowClear
                    style={{ width: '100%' }}
                    placeholder="please enter"
                  />
                  </Form.Item>
                </Col>
                <Col span={11} offset={1}>
                  <Form.Item
                    label={'Street Address'}
                    field="StreetAddress"
                  >
                    <Input
                      allowClear
                      style={{ width: '100%' }}
                      placeholder="please enter"
                    />
                  </Form.Item>

                  <Form.Item
                    label={'City'}
                    field="City"
                  >
                    <Input
                      allowClear
                      style={{ width: '100%' }}
                      placeholder="please enter"
                    />
                  </Form.Item>
                  <Form.Item
                    label={'Region'}
                    field="Region"
                  >
                    <Input
                      allowClear
                      style={{ width: '100%' }}
                      placeholder="please enter"
                    />
                  </Form.Item>
                  <Form.Item
                    label={'Zipcode'}
                    field="Zipcode"
                  >
                    <Input
                      allowClear
                      style={{ width: '100%' }}
                      placeholder="please enter"
                    />
                  </Form.Item>
                  <Form.Item
                    label={'Phone Number'}
                    field="PhoneNumber"
                  >
                    <Input
                      allowClear
                      style={{ width: '100%' }}
                      placeholder="please enter"
                    />
                  </Form.Item>

                  <Form.Item
                    label={'Learner Status'}
                    field="Status"
                  >
                    <Select
                      allowClear
                      options={['On Going', 'Withdrawn', 'Did Not Complete', 'Completed', 'Other']}
                      placeholder="please enter"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item style={{ textAlign: 'center' }}>

                <Space>
                  <Button loading={loading} type="primary" htmlType="submit">
                    {'Submit'}
                  </Button>
                  {handleCancel ? (<Button onClick={handleCancel}>{'Cancel'}</Button>) : (<Button onClick={handleReset}>{'Reset'}</Button>)}
                </Space>
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane key="2" title="School">
            <Form
              form={form}
              className={styles['search-form']}
              labelAlign="left"
              wrapperCol={{ span: 24 }}
              initialValues={{ type: 2 }}
              onSubmit={handleSubmit}
            >
              <Form.Item field="type" hidden><Input /></Form.Item>
              <Form.Item
                label={'School Name'}
                field="School"
                rules={[{ required: true, message: 'required' }]}
              >
                <Select
                  showSearch
                  allowClear
                  options={schoolOption.map((it) => ({
                    label: it.SchoolName,
                    value: it.SchoolName,
                  }))}
                  allowCreate={{
                    formatter: (inputValue) => {
                      return {
                        value: inputValue,
                        label: inputValue,
                      };
                    },
                  }}
                  filterOption={(inputValue, option) =>
                    option.props.value?.label
                      ?.toLowerCase()
                      .indexOf(inputValue.toLowerCase()) >= 0 ||
                    option.props?.children
                      .toLowerCase()
                      .indexOf(inputValue.toLowerCase()) >= 0
                  }
                  placeholder="please select (If the option does not exist, you can enter it manually)"
                />
              </Form.Item>


              <Form.Item
                label={'Teacher Name'}
                field="TeacherName"
              >
                <Input
                  allowClear
                  style={{ width: '100%' }}
                  placeholder="please enter"
                />
              </Form.Item>
              <Form.Item
                label={'Teacher Email'}
                field="TeacherEmail"
              >
                <Input
                  allowClear
                  style={{ width: '100%' }}
                  placeholder="please enter"
                />
              </Form.Item>

              <Form.Item
                label={'Invoice Email'}
                field="InvoiceEmail"
              >
                <Input
                  allowClear
                  style={{ width: '100%' }}
                  placeholder="please enter"
                />
              </Form.Item>
              <Form.Item
                label={'Tutor'}
                field="TutorId"
              >
                <Select
                  allowClear
                  options={teacherList.map((it) => ({
                    label: it.DeliverySpecialist,
                    value: it.Id,
                  }))}
                  placeholder="please enter"
                />
              </Form.Item>

              <Form.Item
                label={'Will your school be resulting the credits with NZQA or will you need us to do that for you?'}
                field="NZQAInfo"
              >
                <Input.TextArea
                  allowClear
                  style={{ width: '100%' }}
                  placeholder="please enter"
                  autoSize={{ minRows: 3, maxRows: 6 }}
                />
              </Form.Item>

              <Form.Item
                label={'Assigned To'}
                field="AssignedTo"
              >
                <Select
                  allowClear
                  options={['', 'School', 'GET Group']}
                  placeholder="please enter"
                />
              </Form.Item>
              <Form.Item style={{ textAlign: 'center' }}>
                <Space>
                  <Button loading={loading} type="primary" htmlType="submit">
                    {'Submit'}
                  </Button>
                  {handleCancel ? (<Button onClick={handleCancel}>{'Cancel'}</Button>) : (<Button onClick={handleReset}>{'Reset'}</Button>)}
                </Space>
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane key="3" title="Courses">

            <Courses
              student={headerInfo}
            />

            <Form
              form={form}
              className={styles['search-form']}
              labelAlign="left"
              wrapperCol={{ span: 24 }}
              initialValues={{ type: 3 }}
              onSubmit={handleSubmit}
            >

              <Row gutter={12}>
                <Col span={11} >

                  <Form.Item
                    label={'Additional Info'}
                    field="AdditionalInfo"
                  >
                    <Input.TextArea
                      allowClear
                      style={{ width: '100%' }}
                      placeholder="please enter"
                      autoSize={{ minRows: 3, maxRows: 6 }}
                    />
                  </Form.Item>
                  <Form.Item
                    label={'Workbook Option'}
                    field="WorkbookOption"
                  >
                    <Input.TextArea
                      allowClear
                      style={{ width: '100%' }}
                      placeholder="please enter"
                      autoSize={{ minRows: 3, maxRows: 6 }}
                    />
                  </Form.Item>
                </Col>
                <Col span={11} >

                  <Form.Item
                    label={'Internal Note'}
                    field="InternalNote"
                  >
                    <Input.TextArea
                      allowClear
                      style={{ width: '100%' }}
                      placeholder="please enter"
                      autoSize={{ minRows: 3, maxRows: 6 }}
                    />
                  </Form.Item>
                  <Form.Item
                    label={'Fees'}
                    field="Fees"
                  >
                    <Select
                      allowClear
                      options={['Paid', 'Parially Paid', 'Un Paid']}
                      placeholder="please enter"
                    />
                  </Form.Item>

                </Col>
              </Row>
              <Form.Item field="type" hidden><Input /></Form.Item>

              <Form.Item style={{ textAlign: 'center' }}>
                <Space>
                  <Button loading={loading} type="primary" htmlType="submit">
                    {'Submit'}
                  </Button>
                  {handleCancel ? (<Button onClick={handleCancel}>{'Cancel'}</Button>) : (<Button onClick={handleReset}>{'Reset'}</Button>)}
                </Space>
              </Form.Item>

              <Form.Item>
                <Upload
                  listType='picture-list'
                  multiple
                  beforeUpload={handleUploader}
                  showUploadList={false}
                ></Upload>
              </Form.Item>
              <Form.Item>
                <List
                  style={{ width: '100%', maxHeight: 250 }}
                  dataSource={ImageList}
                  render={(item, index) => (
                    <List.Item key={index}>
                      <>
                        <Card
                          className='card-with-icon-hover'
                          hoverable
                          style={{ width: 360 }}>
                          <div>
                            <Space
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <Space>
                                <Avatar shape='square'
                                  style={{
                                    backgroundColor: '#165DFF',
                                  }}
                                >
                                  <img alt='avatar' src={`/api/images/${item.FileSaveName}`} />
                                </Avatar>
                                <Typography.Text>{item.FileName}</Typography.Text>
                                <span className='icon-hover' onClick={() => { downloadHandler(item); }}>
                                  <IconDownload
                                    style={{
                                      cursor: 'pointer',
                                    }}
                                  />
                                </span>
                                <span className='icon-hover' onClick={() => { deleteHandler(item); }}>
                                  <IconDelete
                                    style={{
                                      cursor: 'pointer',
                                    }}
                                  />
                                </span>
                              </Space>
                            </Space>
                          </div>
                        </Card>
                      </>
                    </List.Item>
                  )}
                />
              </Form.Item>
            </Form>
          </TabPane>
          <TabPane key="4" title="Comms">
            <CommunicationList
              StudentID={headerInfo.StudentID}
              LearnerName={headerInfo.FirstName + " " + headerInfo.LastName}
              Email={headerInfo.Email}
              studentInfo={headerInfo}
            />
          </TabPane>
        </Tabs>
      </Card>
      {/* <Row gutter={12}>
          <Col span={11} >
            <Form.Item
              label={'Learner First Name'}
              field="FirstName"
              rules={[{ required: true, message: 'required' }]}
            >
              <Input
                allowClear
                style={{ width: '100%' }}
                placeholder="please enter"
              />
            </Form.Item>
            <Form.Item
              label={'Learner Last Name'}
              field="LastName"
              rules={[{ required: true, message: 'required' }]}
            >
              <Input
                allowClear
                style={{ width: '100%' }}
                placeholder="please enter"
              />
            </Form.Item>
            <Form.Item
              label={'School Name'}
              field="School"
              rules={[{ required: true, message: 'required' }]}
            >
              <Select
                showSearch
                allowClear
                options={schoolOption.map((it) => ({
                  label: it.SchoolName,
                  value: it.SchoolName,
                }))}
                allowCreate={{
                  formatter: (inputValue) => {
                    return {
                      value: inputValue,
                      label: inputValue,
                    };
                  },
                }}
                filterOption={(inputValue, option) =>
                  option.props.value?.label
                    ?.toLowerCase()
                    .indexOf(inputValue.toLowerCase()) >= 0 ||
                  option.props?.children
                    .toLowerCase()
                    .indexOf(inputValue.toLowerCase()) >= 0
                }
                placeholder="please select (If the option does not exist, you can enter it manually)"
              />
            </Form.Item>

            <Form.Item
              label={'Date of Birth'}
              field="DateOfBirth"
              rules={[{ required: true, message: 'required' }]}
            >
              <DatePicker format={(value) => `${value.format('DD/MM/YYYY')}`} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label={'Gender'}
              field="Gender"
              rules={[{ required: true, message: 'required' }]}
            >
              <Select
                allowClear
                options={['Male', 'Female', 'Other']}
                placeholder="please enter"
              />
            </Form.Item>

            <Form.Item
              label={'Ethnicity'}
              field="Ethnicity"
              rules={[{ required: true, message: 'required' }]}
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
                placeholder="please select (If the option does not exist, you can enter it manually)"
              />
            </Form.Item>

            <Form.Item
              label={'Email'}
              field="Email"
              rules={[{ required: true, message: 'required' }]}
            >
              <Input
                allowClear
                style={{ width: '100%' }}
                placeholder="please enter"
              />
            </Form.Item>

            <Form.Item
              label={'Learner Status'}
              field="Status"
            >
              <Select
                allowClear
                options={['On Going', 'Withdrawn', 'Did Not Complete', 'Completed', 'Other']}
                placeholder="please enter"
              />
            </Form.Item>
            <Form.Item
              label={'Additional Info'}
              field="AdditionalInfo"
            >
              <Input.TextArea
                allowClear
                style={{ width: '100%' }}
                placeholder="please enter"
                autoSize={{ minRows: 3, maxRows: 6 }}
              />
            </Form.Item>
            <Form.Item
              label={'Internal Note'}
              field="InternalNote"
            >
              <Input.TextArea
                allowClear
                style={{ width: '100%' }}
                placeholder="please enter"
                autoSize={{ minRows: 3, maxRows: 6 }}
              />
            </Form.Item>
            <Form.Item
              label={'Fees'}
              field="Fees"
            >
              <Select
                allowClear
                options={['Paid', 'Parially Paid', 'Un Paid']}
                placeholder="please enter"
              />
            </Form.Item>
            <Form.Item>
              <Upload
                listType='picture-list'
                multiple
                beforeUpload={handleUploader}
                showUploadList={false}
              ></Upload>
            </Form.Item>
            <Form.Item>
              <List
                style={{ width: '100%', maxHeight: 250 }}
                dataSource={ImageList}
                render={(item, index) => (
                  <List.Item key={index}>
                    <>
                      <Card
                        className='card-with-icon-hover'
                        hoverable
                        style={{ width: 360 }}>
                        <div>
                          <Space
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Space>
                              <Avatar shape='square'
                                style={{
                                  backgroundColor: '#165DFF',
                                }}
                              >
                                <img alt='avatar' src={`/api/images/${item.FileSaveName}`} />
                              </Avatar>
                              <Typography.Text>{item.FileName}</Typography.Text>
                              <span className='icon-hover' onClick={() => { downloadHandler(item); }}>
                                <IconDownload
                                  style={{
                                    cursor: 'pointer',
                                  }}
                                />
                              </span>
                              <span className='icon-hover' onClick={() => { deleteHandler(item); }}>
                                <IconDelete
                                  style={{
                                    cursor: 'pointer',
                                  }}
                                />
                              </span>
                            </Space>
                          </Space>
                        </div>
                      </Card>
                    </>
                  </List.Item>
                )}
              />
            </Form.Item>
          </Col>
          <Col span={11} offset={1}>
            <Form.Item
              label={'Workbook Option'}
              field="WorkbookOption"
            >
              <Input.TextArea
                allowClear
                style={{ width: '100%' }}
                placeholder="please enter"
                autoSize={{ minRows: 3, maxRows: 6 }}
              />
            </Form.Item>
            <Form.Item
              label={'Teacher Name'}
              field="TeacherName"
            >
              <Input
                allowClear
                style={{ width: '100%' }}
                placeholder="please enter"
              />
            </Form.Item>
            <Form.Item
              label={'Teacher Email'}
              field="TeacherEmail"
            >
              <Input
                allowClear
                style={{ width: '100%' }}
                placeholder="please enter"
              />
            </Form.Item>
            <Form.Item
              label={'Street Address'}
              field="StreetAddress"
            >
              <Input
                allowClear
                style={{ width: '100%' }}
                placeholder="please enter"
              />
            </Form.Item>

            <Form.Item
              label={'City'}
              field="City"
            >
              <Input
                allowClear
                style={{ width: '100%' }}
                placeholder="please enter"
              />
            </Form.Item>
            <Form.Item
              label={'Region'}
              field="Region"
            >
              <Input
                allowClear
                style={{ width: '100%' }}
                placeholder="please enter"
              />
            </Form.Item>
            <Form.Item
              label={'Zipcode'}
              field="Zipcode"
            >
              <Input
                allowClear
                style={{ width: '100%' }}
                placeholder="please enter"
              />
            </Form.Item>
            <Form.Item
              label={'Invoice Email'}
              field="InvoiceEmail"
            >
              <Input
                allowClear
                style={{ width: '100%' }}
                placeholder="please enter"
              />
            </Form.Item>
            <Form.Item
              label={'Tutor'}
              field="TutorId"
            >
            <Select
              allowClear
              options={teacherList.map((it) => ({
                label: it.DeliverySpecialist,
                value: it.Id,
              }))}
              placeholder="please enter"
            />
            </Form.Item>
            <Form.Item
              label={'Phone Number'}
              field="PhoneNumber"
            >
              <Input
                allowClear
                style={{ width: '100%' }}
                placeholder="please enter"
              />
            </Form.Item>
            <Form.Item
              label={'Will your school be resulting the credits with NZQA or will you need us to do that for you?'}
              field="NZQAInfo"
            >
              <Input.TextArea
                allowClear
                style={{ width: '100%' }}
                placeholder="please enter"
                autoSize={{ minRows: 3, maxRows: 6 }}
              />
            </Form.Item>
            
            <Form.Item
              label={'Assigned To'}
              field="AssignedTo"
            >
              <Select
                allowClear
                options={['', 'School', 'GET Group']}
                placeholder="please enter"
              />
            </Form.Item>
          </Col>
        </Row> */}

    </div>
  );
}

export default UpdateForm;
