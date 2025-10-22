import React, { useContext, useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
} from '@arco-design/web-react';
import * as services from '@/services';
import styles from './index.module.less';

function SearchForm({ handleSubmit, loading, form, isEdit = false, handleCancel = null, IsPaidAllow=false }: any) {
  const handleReset = () => {
    form.resetFields();
  };
  useEffect(() => {
    getOptions();

  }, []);

  const [schoolOption, setSchoolOption] = useState([]);

  const getOptions = () => {
    services.g.getSchool({}).then((res) => {
      setSchoolOption(res?.data || []);
    });
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
        field="DOB"
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
        label={'School Name'}
        field="SchoolName"
        rules={[{ required: true, message: 'required' }]}
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
            } catch (error) { }
          }}
          placeholder="please select (If the option does not exist, you can enter it manually)"
        />
      </Form.Item>
      {isEdit && (
        <Form.Item label={'Student Status'} field="Status">
          <Select
            allowClear
            options={['Ongoing', 'Completed', 'Withdrawn']}
            placeholder="please enter"
          />
        </Form.Item>
      )}

      {IsPaidAllow && (<Form.Item
        label={'Fees'}
        field="Fees"
      >
        <Select
          allowClear
          options={['Paid', 'Parially Paid', 'Un Paid']}
          placeholder="please enter"
        />
      </Form.Item>)}

      {/* {topic?.map((item) => {
                    return (
                      <Form.Item label={item.title} field={item.title}>
                        {item?.options ? (
                          <Select
                            allowClear
                            options={item?.options}
                            placeholder="please enter"
                          />
                        ) : (
                          <Input.TextArea
                            allowClear
                            style={{ width: '100%' }}
                            placeholder="please enter"
                          />
                        )}
                      </Form.Item>
                    );
                  })} */}

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
