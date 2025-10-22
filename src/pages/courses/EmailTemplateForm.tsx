import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Message,
  InputNumber,
  Space,
  Checkbox,
  Upload,
  List, Avatar, Card, Typography, Tabs, Alert, Divider, Modal, Notification
} from '@arco-design/web-react';
import { IconEdit, IconDelete, IconDownload, IconPlus, IconEmail, IconEye } from '@arco-design/web-react/icon';
import { teacher } from '@/services/teacher';
import styles from './index.module.less';
import { commService } from '@/services/communication';
import * as services from '@/services';
import { useSelector } from 'react-redux';
const FormItem = Form.Item;

const AVAILABLE_VARIABLES = [
  { var: '{LearnerName}', description: 'Full name of the learner' },
  { var: '{CourseName}', description: 'Name of the course (if applicable)' }
];

const DataAddForm = ({ rowData, onOk, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [Id, setId] = useState(0);
  const [ImageList, setImageList] = useState([]);
  const [preview, setPreview] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const userInfo = useSelector((state: any) => state.userInfo);

  useEffect(() => {
    if (rowData?.id) {
      setId(rowData.id);
      console.log("rowData");
      console.log(rowData);
      form.setFieldsValue({ ...rowData });
      updatePreview(rowData.Template || '');
    } else {
      setId(0);
      form.resetFields();
      setPreview('');
    }
  }, [rowData]);

  const updatePreview = (template) => {
    // Replace variables with sample data for preview
    let previewText = template || '';
    previewText = previewText.replace(/{LearnerName}/g, 'John Smith');
    previewText = previewText.replace(/{CourseName}/g, 'Introduction to Farming');
    setPreview(previewText);
  };

  const handleTemplateChange = (value) => {
    updatePreview(value);
  };

  const handlePreview = () => {
    const templateValue = form.getFieldValue('Template') || '';
    updatePreview(templateValue);
    setShowPreview(true);
  };

  const handleSendTestEmail = async () => {
    try {
      await form.validate(['Subject', 'Template']);

      const subject = form.getFieldValue('Subject');
      const template = form.getFieldValue('Template');

      if (!userInfo?.mail) {
        Message.warning('Your email address is not available. Please check your profile.');
        return;
      }

      setTestEmailLoading(true);

      const res = await services.student.sendTestEmail({
        email: userInfo.mail,
        subject: subject,
        template: template
      });

      if (res?.code === 0) {
        Notification.success({
          title: 'Test Email Sent',
          content: `A test email has been sent to ${userInfo.mail}`,
          duration: 3000,
        });
      } else {
        throw new Error(res?.message || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      Notification.error({
        title: 'Failed to Send Test Email',
        content: error?.message || 'Please try again.',
        duration: 5000,
      });
    } finally {
      setTestEmailLoading(false);
    }
  };

  const handleSubmit = (values) => {
    setLoading(true);
    if (Id > 0) {
      commService.UpdateTemplate({
        ...values,
        id: Id
      })
        .then((res) => {
          if (res?.code === 0) {
            Message.success(res?.data || 'Template updated successfully');
            onOk(values.Name);
          } else {
            Message.error(res?.message || 'Failed to update template');
          }
        })
        .catch((error) => {
          console.error('Error updating template:', error);
          Message.error('Failed to update template. Please try again.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
    else {
      commService
        .AddTemplate({
          ...values,
          id: 0
        })
        .then((res) => {
          if (res?.code === 0) {
            Message.success(res?.data || 'Template created successfully');
            onOk(values.Name);
          } else {
            Message.error(res?.message || 'Failed to create template');
          }
        })
        .catch((error) => {
          console.error('Error creating template:', error);
          Message.error('Failed to create template. Please try again.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };


  const handleUploader = (file) => {
    /*
    const formData = new FormData();
    console.log("file", file);
    formData.append("file", file);
    formData.append("TemplateID", Id);

    //console.log(headerInfo.AdditionalDocuments || []);
    formData.append("AttachmetsList", JSON.stringify(ImageList));
    formData.append("FileName", file.name);

    services.g.addDocument(formData).then((res) => {
      fetchAttachements();
    });
    */
  }

  const fetchAttachements = () => {
    services.student.getEmailAttachments({ ID: Id }).then((res) => {
      if (res?.data.length > 0) {
        const dataR = JSON.parse(res?.data[0]["Attachments"]);
        setImageList(dataR || []);
      }
    });
  };

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

    services.g.deleteAttachement({
      TemplateID: Id,
      fileName: item.FileSaveName,
      ImageList: JSON.stringify(fImageList),
    }).then((res) => {
      fetchAttachements();
    });

  }

  return (
    <Form
      form={form}
      onSubmit={handleSubmit}
      labelAlign="left"
      wrapperCol={{ span: 24 }}
      className={styles['search-form']}
      size="small"
    >
      <FormItem
        label="Name"
        field="Name"
        rules={[{ required: true, message: 'Template name is required' }]}
      >
        <Input placeholder="e.g., Welcome Email, Invoice Reminder" />
      </FormItem>

      <FormItem
        label="Category"
        field="Category"
        rules={[{ required: false }]}
      >
        <Select
          placeholder="Select a category"
          allowClear
          options={[
            { label: 'General', value: 'General' },
            { label: 'Welcome', value: 'Welcome' },
            { label: 'Reminder', value: 'Reminder' },
            { label: 'Follow-up', value: 'Follow-up' },
            { label: 'Invoice', value: 'Invoice' },
            { label: 'Completion', value: 'Completion' },
          ]}
        />
      </FormItem>

      <FormItem
        label="Subject"
        field="Subject"
        rules={[{ required: true, message: 'Email subject is required' }]}
      >
        <Input placeholder="e.g., Welcome to The Get Group!" />
      </FormItem>


      <Form.Item
        label={'Template'}
        field="Template"
        rules={[{ required: true, message: 'Please enter' }]}
        extra={
          <div>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Available variables: {AVAILABLE_VARIABLES.map(v => v.var).join(', ')}
            </Typography.Text>
          </div>
        }
      >
        <Input.TextArea
          allowClear
          style={{ width: '100%' }}
          placeholder="Enter your email template here. Use {LearnerName} and {CourseName} as placeholders."
          autoSize={{ minRows: 5, maxRows: 10 }}
          onChange={(value) => handleTemplateChange(value)}
        />
      </Form.Item>

      <Alert
        type="info"
        content={
          <div>
            <Typography.Text bold>Available Template Variables:</Typography.Text>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              {AVAILABLE_VARIABLES.map((item, index) => (
                <li key={index}>
                  <Typography.Text code>{item.var}</Typography.Text> - {item.description}
                </li>
              ))}
            </ul>
          </div>
        }
        style={{ marginBottom: 16 }}
      />

      {preview && (
        <Form.Item label="Live Preview">
          <Card
            style={{ backgroundColor: '#f7f8fa', padding: '12px', borderRadius: '4px' }}
            bordered
          >
            <Typography.Text style={{ whiteSpace: 'pre-wrap' }}>
              {preview}
            </Typography.Text>
          </Card>
        </Form.Item>
      )}

      {/* <Form.Item>
        <Upload
          listType='picture-list'
          multiple
          beforeUpload={handleUploader}
          showUploadList={false}
        ></Upload>
      </Form.Item> */}
      {/* <Form.Item>
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
      </Form.Item> */}
      <Divider />

      <Form.Item style={{ textAlign: 'center' }}>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {Id > 0 ? 'Update' : 'Save'} Template
          </Button>
          <Button
            type="outline"
            icon={<IconEmail />}
            loading={testEmailLoading}
            onClick={handleSendTestEmail}
          >
            Send Test Email
          </Button>
          <Button onClick={onCancel}>Cancel</Button>
        </Space>
      </Form.Item>

      {userInfo?.mail && (
        <Typography.Text
          type="secondary"
          style={{ display: 'block', textAlign: 'center', fontSize: 12, marginTop: -8 }}
        >
          Test email will be sent to: {userInfo.mail}
        </Typography.Text>
      )}
    </Form>
  );
};

export default DataAddForm;
