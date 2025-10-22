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
import { teacher } from '@/services/teacher';
import styles from './index.module.less';
import { adminUser } from '@/services/adminUser';
const FormItem = Form.Item;

const DataAddForm = ({ rowData, onOk, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [Id, setId] = useState(0);
  const [markAsDefault, setMarkAsDefault] = useState(false);
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    if (rowData?.Id) {
      setId(rowData.Id);
      console.log("rowData");
      console.log(rowData);
      setMarkAsDefault(rowData.MarkAsDefault);
      form.setFieldsValue({ ...rowData });
    } else {
      setId(0);
      setMarkAsDefault(false);
      form.resetFields();
    }
    fetchUserDataLists();
  }, [rowData]);

  const fetchUserDataLists = async (data = {}) => {
    setLoading(true);
    adminUser.getActiveAll()
      .then((res) => {
        setUserList(res?.data || []);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleReset = () => {
    form.resetFields();
  };
  const handleSubmit = (values) => {
    if (Id > 0) {
      teacher
        .UpdateTeacher({
          ...values,
          MarkAsDefault: markAsDefault,
          Id: Id
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
    else {
      teacher
        .AddTeacher({
          ...values,
          MarkAsDefault: markAsDefault,
          Id: 0
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

  const handleChange = (value) => {
    setMarkAsDefault(value);
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
        label="Teacher Name"
        field="DeliverySpecialist"
        rules={[{ required: true, message: 'Please enter' }]}
      >
        <Input placeholder="Please enter" />
      </FormItem>
      <Form.Item
        label={'User'}
        field="UserId"
      >
        <Select
          allowClear
          options={userList.map((it) => ({
            label: it.Name,
            value: it.Id,
          }))}
          placeholder="please enter"
        />
      </Form.Item>
      <FormItem
        label="Mark As Default"
        field="MarkAsDefault">
        <Checkbox checked={markAsDefault} onChange={handleChange} ></Checkbox>
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
