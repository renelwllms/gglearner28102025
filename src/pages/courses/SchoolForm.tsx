import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Message,
  InputNumber,
  Space,
  Divider,
  Grid,
} from '@arco-design/web-react';
import * as services from '@/services';
import styles from './index.module.less';
const FormItem = Form.Item;
const { Row, Col } = Grid;

const SchoolEditForm = ({ rowData, onOk, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (rowData?.SchoolNumber) {
      form.setFieldsValue({ ...rowData });
    } else {
      form.resetFields();
    }
  }, [rowData]);

  const handleReset = () => {
    form.resetFields();
  };
  const handleSubmit = (values) => {
    setLoading(true);
    const schoolName = values.SchoolName;
    const isEdit = rowData?.SchoolNumber ? true : false;

    services.course
      .addSchool({
        SchoolNumber: rowData?.SchoolNumber || void 0,
        ...values,
      })
      .then((res) => {
        if (res?.data) {
          Message.success({
            content: `School "${schoolName}" has been ${isEdit ? 'updated' : 'created'} successfully.`,
            duration: 3000,
          });
          onOk(schoolName);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Form
      form={form}
      onSubmit={handleSubmit}
      labelAlign="left"
      layout="vertical"
      className={styles['search-form']}
      autoComplete="off"
    >
      {/* Basic Information Section */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 16px 0', color: '#1D2129', fontWeight: 600 }}>
          Basic Information
        </h4>
        <Row gutter={16}>
          <Col span={24}>
            <FormItem
              label="School Name"
              field="SchoolName"
              rules={[{ required: true, message: 'School name is required' }]}
            >
              <Input placeholder="Enter school name" />
            </FormItem>
          </Col>
          <Col span={12}>
            <Form.Item
              label="School Type"
              field="SchoolType"
            >
              <Select
                allowClear
                options={['Composite', 'Composite (Year 1-10)', 'Composite (Year 1-15)', 'Contributing', 'Correspondence School', 'Intermediate', 'Private Secondary (Years 9-13)', 'Restricted Composite (Year 7-10)', 'Secondary (Year 11-15)', 'Secondary (Year 7-10)', 'Secondary (Year 7-15)', 'Secondary (Year 9-15)', 'Special School', 'Teen Parent Unit']}
                placeholder="Select school type"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Urban Area"
              field="UrbanArea"
            >
              <Select
                allowClear
                options={['Central Auckland Zone', 'Main Urban Area', 'Marton', 'Minor Urban Area', 'Northern Auckland Zone', 'Not Applicable', 'Rotorua', 'Rural Area', 'Rural Centre', 'Secondary Urban Area', 'Southern Auckland Zone', 'Upper Hutt Zone', 'Western Auckland Zone', 'Whakatane']}
                placeholder="Select urban area"
              />
            </Form.Item>
          </Col>
        </Row>
      </div>

      <Divider />

      {/* Contact Information Section */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 16px 0', color: '#1D2129', fontWeight: 600 }}>
          Contact Information
        </h4>
        <Row gutter={16}>
          <Col span={12}>
            <FormItem
              label="Telephone"
              field="Telephone"
              rules={[
                {
                  pattern: /^[\d\s\-\+\(\)]*$/,
                  message: 'Please enter a valid phone number'
                }
              ]}
            >
              <Input placeholder="e.g., 09 123 4567" />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label="Fax"
              field="Fax"
              rules={[
                {
                  pattern: /^[\d\s\-\+\(\)]*$/,
                  message: 'Please enter a valid fax number'
                }
              ]}
            >
              <Input placeholder="e.g., 09 123 4567" />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label="Email"
              field="Email"
              rules={[
                {
                  type: 'email',
                  message: 'Please enter a valid email address'
                }
              ]}
            >
              <Input placeholder="e.g., admin@school.co.nz" />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label="School Website"
              field="SchoolWebsite"
              rules={[
                {
                  pattern: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                  message: 'Please enter a valid website URL'
                }
              ]}
            >
              <Input placeholder="e.g., https://school.co.nz" />
            </FormItem>
          </Col>
        </Row>
      </div>

      <Divider />

      {/* Address Information Section */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 16px 0', color: '#1D2129', fontWeight: 600 }}>
          Address Information
        </h4>
        <Row gutter={16}>
          <Col span={12}>
            <FormItem
              label="Street"
              field="Street">
              <Input placeholder="Enter street address" />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label="Suburb"
              field="Suburb">
              <Input placeholder="Enter suburb" />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label="City"
              field="City">
              <Input placeholder="Enter city" />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label="Postal Code"
              field="PostalCode">
              <Input placeholder="Enter postal code" />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label="Postal Address 1"
              field="PostalAddress1">
              <Input placeholder="Address line 1" />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label="Postal Address 2"
              field="PostalAddress2">
              <Input placeholder="Address line 2" />
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label="Postal Address 3"
              field="PostalAddress3">
              <Input placeholder="Address line 3" />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label="DHB (District Health Board)"
              field="DHB">
              <Input placeholder="Enter DHB" />
            </FormItem>
          </Col>
        </Row>
      </div>

      <Divider />

      {/* Action Buttons */}
      <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
        <Space size="medium">
          <Button onClick={onCancel} size="large">
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} size="large">
            {rowData?.SchoolNumber ? 'Update School' : 'Create School'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default SchoolEditForm;
