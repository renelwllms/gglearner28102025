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
import * as services from '@/services';
import styles from './index.module.less';
const FormItem = Form.Item;
const Option = Select.Option;

const CourseEditForm = ({ rowData, onOk, unitStandards, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    if (rowData?.CourseID) {
      form.setFieldsValue({ ...rowData });
      setIsCustom(rowData.IsCustom);
    } else {
      form.resetFields();
      setIsCustom(false);
    }
  }, [rowData]);

  const handleReset = () => {
    form.resetFields();
  };
  const handleSubmit = (values) => {
    setLoading(true);
    if (rowData?.CourseID) {
      services.course
        .updateCourse({
          CourseID: rowData?.CourseID,
          ...values,
          IsCustom: isCustom,
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
    } else {
      services.course
        .addCourse({
          ...values,
          IsCustom: isCustom,
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
    }
  };
  
  const handleCustomChange = (value) => {
    setIsCustom(value);
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
        label="Course Name"
        field="CourseName"
        rules={[{ required: true, message: 'Please enter course name' }]}
      >
        <Input placeholder="Enter course name" />
      </FormItem>
      <FormItem label="Course Details" field="CourseDetails">
        <Input.TextArea placeholder="Enter course details" />
      </FormItem>
      <FormItem
        label="Course Level"
        field="CourseLevel"
        rules={[{ required: true, message: 'Please enter course level' }]}
      >
        <InputNumber placeholder="Enter course level" min={1} />
      </FormItem>
      <FormItem
        label="Course Credits"
        field="CourseCredits"
        rules={[{ required: true, message: 'Please enter course credits' }]}
      >
        <InputNumber placeholder="Enter course credits" min={1} />
      </FormItem>
      <FormItem label="Course Delivery" field="CourseDelivery">
        <Input placeholder="Please enter" />
      </FormItem>
      <FormItem label="Course Group" field="CourseGroup">
        <Input placeholder="Enter course group" />
      </FormItem>
      <FormItem label="Unit Standards" field="UnitStandardIDs">
        <Select
          mode="multiple"
          placeholder="Select unit standards"
          allowClear
          showSearch
          filterOption={(inputValue, option) => {
            return (
              option.props?.children
                ?.toLowerCase()
                ?.indexOf(inputValue?.toLowerCase()) >= 0
            );
          }}
        >
          {unitStandards.map((us) => (
            <Option key={us.UnitStandardID} value={us.UnitStandardID}>
              {`${us.US} - ${us.USName}`}
            </Option>
          ))}
        </Select>
      </FormItem>
      <FormItem
        label="Is Custom"
        field="IsCustom">
        <Checkbox checked={isCustom} onChange={handleCustomChange} ></Checkbox>
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
