import React, { useContext, useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Grid,
  Space,
  InputNumber,
  Notification,
} from '@arco-design/web-react';
import { IconRefresh } from '@arco-design/web-react/icon';
import styles from './index.module.less';
import { useSelector } from 'react-redux';
import * as services from '@/services';
import { teacher } from '@/services/teacher';
import { getAddressFromSchool } from '@/utils/addressHelper';
const { Row, Col } = Grid;
const { useForm } = Form;
const Option = Select.Option;

interface SearchFormProps {
  onSubmit: (values: string) => void;
  IsPaidAllow: boolean;
}

function SearchForm(props: SearchFormProps) {
  const [form] = useForm();
  const token = useSelector((state: any) => state.token);
  const [loading, setLoading] = useState(false);
  const [courseOption, setCourse] = useState([]);
  const [showCustom, setShowCustom] = useState(false);
  const [customCourse, setCustomCourse] = useState([]);
  const [schoolOption, setSchoolOption] = useState([]);
  const [schoolOptionVal, setSchoolOptionVal] = useState();
  const [teacherList, setTeacherList] = useState([]);
  const [unitStandards, setUnitStandards] = useState([]);
  const IsPaidAllow = props.IsPaidAllow;

  useEffect(() => {
    if (token) {
      getOptions();
      fetchTeacherLists();
      fetchUnits();
    }
  }, [token]);

  const getOptions = async (data = {}) => {
    try {
      const [courseRes, schoolRes] = await Promise.all([
        services.g.getCourse({}),
        services.g.getSchool({})
      ]);
      setCourse(courseRes?.data || []);
      setCustomCourse(courseRes?.data.filter(x => x.IsCustom == true).map(x => x.CourseID));
      setSchoolOption(schoolRes?.data || []);
    } catch (error) {
      console.error('Failed to load options:', error);
      Notification.error({
        title: 'Error',
        content: 'Failed to load course and school options. Please refresh the page.',
        duration: 5000,
      });
    }
  };

  const fetchUnits = async (data = {}) => {
    try {
      const res = await services.course.getUnits(data);
      setUnitStandards(res?.data || []);
    } catch (error) {
      console.error('Failed to load unit standards:', error);
      Notification.error({
        title: 'Error',
        content: 'Failed to load unit standards.',
        duration: 3000,
      });
    }
  };

  const fetchTeacherLists = async (data = {}) => {
    try {
      const res = await teacher.getAll(data);
      setTeacherList(res?.data || []);
    } catch (error) {
      console.error('Failed to load teachers:', error);
      Notification.error({
        title: 'Error',
        content: 'Failed to load teacher list.',
        duration: 3000,
      });
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      let SchoolNumber = values?.SchoolName?.value;
      let SchoolName = values?.SchoolName?.label;
      if (typeof values?.SchoolName?.value !== 'number') {
        SchoolNumber = 0;
        SchoolName = values?.SchoolName?.value;
      }
      const Location = getAddressFromSchool(schoolOptionVal);
      const postData = {
        ...values,
        CourseID: values?.CourseID?.value,
        CourseName: values?.CourseID?.label,
        SchoolNumber,
        SchoolName,
        Location,
        TutorId: values?.TutorId,
      };

      const res = await services.g.addWorkshop(postData);
      if (res?.data) {
        const workshopData = typeof res.data === 'object' ? res.data : { code: res.data, qrCode: null };
        Notification.success({
          title: 'Success',
          content: `Workshop created successfully! Code: ${workshopData.code}`,
          duration: 4000,
        });
        props.onSubmit(workshopData);
        handleReset();
      }
    } catch (error) {
      console.error('Failed to create workshop:', error);
      Notification.error({
        title: 'Error',
        content: 'Failed to create workshop. Please try again.',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setSchoolOptionVal(undefined);
    setShowCustom(false);
  };

  const onChangeCourse = (value) => {
    if (customCourse.includes(value.value)) {
      setShowCustom(true);
    }
    else {
      setShowCustom(false);
    }
  };

  return (
    <div className={styles['search-form-wrapper']}>
      <Form
        form={form}
        className={styles['search-form']}
        labelAlign="left"
        wrapperCol={{ span: 24 }}
        onSubmit={handleSubmit}
      >
        <Form.Item
          label={'Workshop Name'}
          field="CourseID"
          rules={[{ required: true, message: 'Please select a workshop name' }]}
        >
          <Select
            allowCreate
            labelInValue
            showSearch
            allowClear
            options={courseOption.map((it) => ({
              label: it.CourseName,
              value: it.CourseID,
            }))}
            filterOption={(inputValue, option) =>
              option.props.value?.label
                ?.toLowerCase()
                .indexOf(inputValue.toLowerCase()) >= 0 ||
              option.props?.children
                .toLowerCase()
                .indexOf(inputValue.toLowerCase()) >= 0
            }
            placeholder="please enter"
            onChange={onChangeCourse}
          />
        </Form.Item>
        {showCustom && <Form.Item label="Unit Standards" field="UnitStandardIDs">
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
        </Form.Item>}

        <Form.Item
          label={'Course Date'}
          field="CourseDate"
          rules={[{ required: true, message: 'Please select a course date' }]}
        >
          <DatePicker format={(value) => `${value.format('DD/MM/YYYY')}`} style={{ width: '100%' }} />
        </Form.Item>
        <Row>
          <Form.Item
            label={'School Name'}
            field="SchoolName"
            rules={[{ required: true, message: 'Please select or enter a school name' }]}
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
                    label: inputValue,
                  };
                },
              }}
              filterOption={(inputValue, option) =>
                option.props.value?.label
                  ?.toLowerCase()
                  .indexOf(inputValue.toLowerCase()) >= 0 ||
                option.props?.children
                  .toLowerCase()
                  .indexOf(inputValue.toLowerCase()) >= 0
              }
              placeholder="please select (If the option does not exist, you can enter it manually)"
              onChange={(e) => {
                var filterOpt = schoolOption.filter((opt) => opt.SchoolNumber == e.value);
                if (filterOpt.length > 0) {
                  setSchoolOptionVal(filterOpt[0]);
                }
                else {
                  setSchoolOptionVal(null);
                }
              }}
            />
          </Form.Item>
        </Row>
        {schoolOptionVal && <p>{getAddressFromSchool(schoolOptionVal)}</p>}

        <Form.Item
          label={'Number of learners attending'}
          field="StudentsNum"
          rules={[{ required: true, message: 'Please enter the number of learners attending' }]}
        >
          <InputNumber
            placeholder="Please enter"
            min={0}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item
          label={'Teacher'}
          field="TutorId"
          rules={[{ required: true, message: 'Please select a teacher' }]}
        >
          <Select
            allowClear
            options={teacherList.map((it) => ({
              label: it.DeliverySpecialist,
              value: it.Id,
            }))}
            placeholder="Select teacher"
          />
        </Form.Item>

        {IsPaidAllow && (<Form.Item
          label={'Payment Status'}
          field="PaymentStatus"
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
            <Button onClick={handleReset}>{'Reset'}</Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}

export default SearchForm;
