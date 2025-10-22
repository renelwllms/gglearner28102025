import React, { useContext, useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Notification,
} from '@arco-design/web-react';
import * as services from '@/services';
import styles from './index.module.less';

interface SearchFormProps {
  handleSubmit: (values: any) => void;
  loading: boolean;
  form: any;
  isEdit?: boolean;
  handleCancel?: (() => void) | null;
  IsPaidAllow?: boolean;
}

function SearchForm({ handleSubmit, loading, form, isEdit = false, handleCancel = null, IsPaidAllow = false }: SearchFormProps) {
  const handleReset = () => {
    form.resetFields();
  };
  useEffect(() => {
    getOptions();

  }, []);

  const [schoolOption, setSchoolOption] = useState([]);

  const getOptions = async () => {
    try {
      const res = await services.g.getSchool({});
      setSchoolOption(res?.data || []);
    } catch (error) {
      console.error('Failed to load schools:', error);
      Notification.error({
        title: 'Error',
        content: 'Failed to load school list. Please refresh the page.',
        duration: 5000,
      });
    }
  };

  return (
    <Form
      form={form}
      className={styles['search-form']}
      labelAlign="left"
      wrapperCol={{ span: 24 }}
      onSubmit={handleSubmit}
    >
      <Form.Item
        label={'First Name'}
        field="FirstName"
        rules={[{ required: true, message: 'Please enter your first name' }]}
      >
        <Input
          allowClear
          style={{ width: '100%' }}
          placeholder="Enter your first name"
        />
      </Form.Item>
      <Form.Item
        label={'Last Name'}
        field="LastName"
        rules={[{ required: true, message: 'Please enter your last name' }]}
      >
        <Input
          allowClear
          style={{ width: '100%' }}
          placeholder="Enter your last name"
        />
      </Form.Item>

      <Form.Item
        label={'Date of Birth'}
        field="DOB"
        rules={[{ required: true, message: 'Please select your date of birth' }]}
      >
        <DatePicker format={(value) => `${value.format('DD/MM/YYYY')}`} style={{ width: '100%' }} placeholder="Select your date of birth" />
      </Form.Item>

      <Form.Item
        label={'Gender'}
        field="Gender"
        rules={[{ required: true, message: 'Please select your gender' }]}
      >
        <Select
          allowClear
          options={['Male', 'Female', 'Other']}
          placeholder="Select your gender"
        />
      </Form.Item>

      <Form.Item
        label={'Ethnicity'}
        field="Ethnicity"
        rules={[{ required: true, message: 'Please select your ethnicity' }]}
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
          placeholder="Select your ethnicity (or enter manually)"
        />
      </Form.Item>

      <Form.Item
        label={'Email'}
        field="Email"
        rules={[
          { required: true, message: 'Please enter your email address' },
          {
            type: 'email',
            message: 'Please enter a valid email address',
          },
        ]}
      >
        <Input
          allowClear
          type="email"
          style={{ width: '100%' }}
          placeholder="Enter your email address"
        />
      </Form.Item>
      <Form.Item
        label={'School Name'}
        field="SchoolName"
        rules={[{ required: true, message: 'Please select your school' }]}
      >
        <Select
          labelInValue
          showSearch
          allowClear
          options={schoolOption.map((it) => ({
            label: it.SchoolName,
            value: it.SchoolNumber,
          }))}
          allowCreate={{
            formatter: (inputValue) => {
              return {
                value: inputValue,
                label: `${'Custom: '}${inputValue}`,
              };
            },
          }}
          filterOption={(inputValue, option) => {
            try {
              return (
                option?.props.value?.label
                  ?.toLowerCase()
                  ?.indexOf(inputValue?.toLowerCase()) >= 0 ||
                option?.props?.children
                  ?.toLowerCase()
                  ?.indexOf(inputValue?.toLowerCase()) >= 0
              );
            } catch (error) {
              console.error('Filter option error:', error);
              return false;
            }
          }}
          placeholder="Select your school (or enter manually)"
        />
      </Form.Item>
      {isEdit && (
        <Form.Item label={'Student Status'} field="Status">
          <Select
            allowClear
            options={['Ongoing', 'Completed', 'Withdrawn']}
            placeholder="Select student status"
          />
        </Form.Item>
      )}

      {IsPaidAllow && (<Form.Item
        label={'Fees'}
        field="Fees"
      >
        <Select
          allowClear
          options={['Paid', 'Partially Paid', 'Unpaid']}
          placeholder="Select payment status"
        />
      </Form.Item>)}

      <Form.Item style={{ textAlign: 'center' }}>
        <Space>
          <Button loading={loading} type="primary" htmlType="submit">
            {'Submit'}
          </Button>
          {handleCancel ? (<Button onClick={handleCancel}>{'Cancel'}</Button>) : (<Button onClick={handleReset}>{'Reset'}</Button>)}
        </Space>
      </Form.Item>
    </Form>
  );
}

export default SearchForm;
