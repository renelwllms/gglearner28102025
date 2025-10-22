import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Message,
  InputNumber,
  Space,
} from '@arco-design/web-react';
import * as services from '@/services';
import styles from './index.module.less';
const FormItem = Form.Item;

const CourseEditForm = ({ rowData, onOk, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (rowData?.UnitStandardID) {
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

    services.course
      .updateUnitstandard({
        UnitStandardID: rowData?.UnitStandardID || void 0,
        ...values,
      })
      .then((res) => {
        if (res?.data) {
          Message.success('success');
          onOk();
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
      wrapperCol={{ span: 24 }}
      className={styles['search-form']}
      size="small"
    >
      <FormItem
        label="Unit Standard"
        field="US"
        rules={[{ required: true, message: 'Please enter' }]}
      >
        <Input placeholder="Please enter" />
      </FormItem>
      <FormItem
        label="Unit Standard Name"
        field="USName"
        rules={[{ required: true, message: 'Please enter' }]}
      >
        <Input placeholder="Please enter" />
      </FormItem>

      <FormItem
        label="Level"
        field="USLevel"
        rules={[{ required: true, message: 'Please enter' }]}
      >
        <InputNumber placeholder="Please enter" min={1} />
      </FormItem>
      <FormItem
        label="Credits"
        field="USCredits"
        rules={[{ required: true, message: 'Please enter' }]}
      >
        <InputNumber placeholder="Please enter" min={1} />
      </FormItem>
      <FormItem label="Description" field="USDescription">
        <Input.TextArea placeholder="Please enter" />
      </FormItem>
      <FormItem
        label="Version"
        field="USVersion"
        rules={[{ required: true, message: 'Please enter' }]}
      >
        <InputNumber placeholder="Please enter" min={1} />
      </FormItem>
      <FormItem label="Classification" field="USClassification">
        <Input placeholder="Please enter" />
      </FormItem>
      <FormItem label="URL" field="USURL">
        <Input placeholder="Please enter" />
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

export default CourseEditForm;
