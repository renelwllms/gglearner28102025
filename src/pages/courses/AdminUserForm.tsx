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
} from '@arco-design/web-react';
import { adminUser } from '@/services/adminUser';
import styles from './index.module.less';
const FormItem = Form.Item;

const DataAddForm = ({ rowData, onOk , onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [Id, setId] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (rowData?.Id) {
      setId(rowData.Id);
      setIsActive(rowData.IsActive);
      form.setFieldsValue({ ...rowData });
    } else {
      setId(0);
      setIsActive(false);
      form.resetFields();
      // Set default role to 'User' for new users
      form.setFieldValue('UserRole', 'User');
    }

  }, [rowData]);

  const handleReset = () => {
    setIsActive(false);
    form.resetFields();
  };
  const handleSubmit = (values) => {
    if(Id > 0){
      adminUser
        .Update({
          ...values,
          IsActive: isActive,
          Id: Id
        })
        .then((res) => {
          if (res?.data) {
            Message.success('success');
            onOk(values.Name);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
    else{
      adminUser
        .Add({
          ...values,
          IsActive: isActive,
          Id: 0
        })
        .then((res) => {
          if (res?.data) {
            Message.success('success');
            onOk(values.Name);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleChange = (value) => {
    setIsActive(value);
  };

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
        rules={[{ required: true, message: 'Please enter' }]}
      >
        <Input placeholder="Please enter" />
      </FormItem>
      <FormItem
        label="Email"
        field="Email"
        rules={[{ required: true, message: 'Please enter' }]}
      >
        <Input placeholder="Please enter" />
      </FormItem>
      <Form.Item
        label={'User Role'}
        field="UserRole"
        rules={[{ required: true, message: 'Please select a user role' }]}
      >
        <Select
          options={['Admin', 'User']}
          placeholder="Select user role"
        />
      </Form.Item>
      <FormItem
        label="Active"
        field="IsActive">
        <Checkbox checked={isActive} onChange={handleChange} ></Checkbox>
      </FormItem>
      <Form.Item style={{ textAlign: 'center' }}>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            Submit
          </Button>
          <Button onClick={onCancel}>{'Cancel'}</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default DataAddForm;
