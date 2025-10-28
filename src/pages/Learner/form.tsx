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
    console.log('Form mounted - loading schools and workshops');
    getOptions();
    getWorkshops();
  }, []);

  const [schoolOption, setSchoolOption] = useState([]);
  const [workshopOptions, setWorkshopOptions] = useState([]);

  const getOptions = async () => {
    try {
      const res = await services.g.getSchool({});
      // Sort schools alphabetically by SchoolName
      const sortedSchools = (res?.data || []).sort((a, b) => {
        const nameA = a.SchoolName?.toLowerCase() || '';
        const nameB = b.SchoolName?.toLowerCase() || '';
        return nameA.localeCompare(nameB);
      });
      setSchoolOption(sortedSchools);
    } catch (error) {
      console.error('Failed to load schools:', error);
      Notification.error({
        title: 'Error',
        content: 'Failed to load school list. Please refresh the page.',
        duration: 5000,
      });
    }
  };

  const getWorkshops = async () => {
    try {
      const res = await services.g.getWorkshop({});
      setWorkshopOptions(res?.data || []);
    } catch (error) {
      console.error('Failed to load workshops:', error);
    }
  };

  const handleWorkshopChange = async (code: string) => {
    console.log('Workshop changed, code:', code);
    if (!code) {
      console.log('No code provided, skipping auto-population');
      return;
    }
    try {
      console.log('Fetching workshop info for code:', code);
      const res = await services.g.getWorkshopInforByCode({ Code: code });
      console.log('Workshop API response:', res);
      const workshopData = res?.data?.[0];
      console.log('Workshop data:', workshopData);
      if (workshopData && workshopData.SchoolNumber && workshopData.SchoolName) {
        console.log('Setting school field to:', { label: workshopData.SchoolName, value: workshopData.SchoolNumber });
        // Auto-populate school name from workshop
        form.setFieldValue('SchoolName', {
          label: workshopData.SchoolName,
          value: workshopData.SchoolNumber,
        });
        Notification.success({
          title: 'School Auto-Populated',
          content: `School set to: ${workshopData.SchoolName}`,
          duration: 3000,
        });
      } else {
        console.log('Workshop data missing school info');
      }
    } catch (error) {
      console.error('Failed to fetch workshop info:', error);
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
        label={'Workshop Code (Optional)'}
        field="Code"
        tooltip="Select a workshop to auto-populate the school name"
      >
        <Select
          showSearch
          allowClear
          onChange={handleWorkshopChange}
          placeholder="Select workshop (optional)"
          filterOption={(inputValue, option) => {
            const code = option.props.value || '';
            const courseName = option.props.children || '';
            return (
              code.toLowerCase().includes(inputValue.toLowerCase()) ||
              courseName.toLowerCase().includes(inputValue.toLowerCase())
            );
          }}
        >
          {workshopOptions.map((workshop) => (
            <Select.Option key={workshop.Code} value={workshop.Code}>
              {workshop.Code} - {workshop.CourseName} ({workshop.SchoolName})
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label={'School Name'}
        field="SchoolName"
        rules={[{ required: true, message: 'Please select your school' }]}
        tooltip="Auto-populated from workshop, or select/enter manually"
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
