import React, { useState } from 'react';
import {
  Form,
  Grid,
  Select,
  Space,
  Button,
  Input,
  Checkbox,
  Message,
  Spin,
} from '@arco-design/web-react';
import { IconSearch, IconRefresh } from '@arco-design/web-react/icon'; // 确保你有正确导入图标

import * as services from '@/services';
import styles from './index.module.less';
import { useSelector } from 'react-redux';
const { Row, Col } = Grid;
const YourComponent = ({ rowData, ok, Code, isAll }) => {
  const [form] = Form.useForm();
  const [useDefaultEmail, setUseDefaultEmail] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const userInfo = useSelector((state: any) => state.userInfo);

  const handleCertificateChange = (value) => {
    setSelectedCertificate(value);
  };

  const handleCheckboxChange = (e) => {
    setUseDefaultEmail(e);
  };

  const handleSubmit = (values) => {
    setLoading(true);
    services.g
      .sendcertificateEmail({
        StudentID: !isAll ? rowData.StudentID : void 0,
        Code: Code,
        email: useDefaultEmail ? userInfo.mail : values.email,
        Id: rowData?.id,
        reportType: values.type,
        NSN: values.NSN
      })
      .then((res) => {
        if (res.data) {
          Message.success('Successfully sent!');
          ok();
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleReset = () => {
    form.resetFields();
    setUseDefaultEmail(false);
    setSelectedCertificate(null);
  };

  return (
    <>
      <Spin tip="Just a moment..." loading={loading}>
        {!isAll ? (
          <p>
            Learner Name:
            {`${rowData.FirstName || ''} ${rowData.LastName || ''}`}
          </p>
        ) : (
          <p>Generate certificates for all learners in the workshop</p>
        )}
        <Form
          form={form}
          className={styles['search-form']}
          layout={'vertical'}
          labelAlign="left"
          wrapperCol={{ span: 24 }}
          style={{
            display: 'inline-block',
            marginBottom: '10px',
          }}
          onSubmit={handleSubmit}
        >
          <Row>
            <Form.Item
              label={'Choose Certificate'}
              field="type"
              rules={[{ required: true, message: 'required' }]}
            >
              <Select
                showSearch
                options={[
                  {
                    label: 'Certificate of Achievement',
                    value: 1,
                  },
                  {
                    label: 'Micro-Credential',
                    value: 2,
                  },
                ]}
                placeholder="Please enter"
                onChange={handleCertificateChange}
              />
            </Form.Item>
            <Form.Item>
              <Checkbox
                checked={useDefaultEmail}
                onChange={handleCheckboxChange}
              >
                Send to default email
              </Checkbox>
            </Form.Item>
            {!useDefaultEmail && (
              <Form.Item
                label={'Send to Email'}
                field="email"
                rules={[
                  { required: true, message: 'required' },
                  {
                    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: 'Please enter a valid email!',
                  },
                ]}
              >
                <Input placeholder="Please enter email address" />
              </Form.Item>
            )}
            <Form.Item style={{ textAlign: 'center' }}>
              <Space>
                <Button
                  type="primary"
                  loading={loading}
                  onClick={() => {
                    form.submit();
                  }}
                >
                  {'Submit'}
                </Button>
                <Button onClick={handleReset}>{'Reset'}</Button>
              </Space>
            </Form.Item>
          </Row>
        </Form>
      </Spin>
    </>
  );
};

export default YourComponent;
