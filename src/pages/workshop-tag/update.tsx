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

interface UpdateFormProps {
  loading: boolean;
  form: any;
  handleSubmit: (values: any) => void;
  handleCancel: () => void;
  rowData: any;
}

function UpdateForm({ loading, form, handleSubmit, handleCancel, rowData }: UpdateFormProps) {
  const token = useSelector((state: any) => state.token);
  const [courseOption, setCourse] = useState([]);
  const [customCourse, setCustomCourse] = useState([]);
  const [schoolOption, setSchoolOption] = useState([]);
  const [schoolOptionVal, setSchoolOptionVal] = useState();
  const [teacherList, setTeacherList] = useState([]);
  const [unitStandards, setUnitStandards] = useState([]);
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    if (token) {
      getOptions();
      fetchTeacherLists();
      fetchUnits();
    }

    if(rowData?.UnitStandardIDs?.length > 0){
      setShowCustom(true);
      form.setFieldsValue({
        UnitStandardIDs: rowData.UnitStandardIDs.split(",").map(id => Number(id))
      });
    }

  }, [token, rowData]);

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
    }
  };

  const fetchUnits = async (data = {}) => {
    try {
      const res = await services.course.getUnits(data);
      setUnitStandards(res?.data || []);
    } catch (error) {
      console.error('Failed to load unit standards:', error);
    }
  };

  const fetchTeacherLists = async (data = {}) => {
    try {
      const res = await teacher.getAll(data);
      setTeacherList(res?.data || []);
    } catch (error) {
      console.error('Failed to load teachers:', error);
    }
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
          field="CourseName"
        >
          <Select
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
            placeholder="Select workshop"
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
          rules={[{ required: true, message: 'required' }]}
        >
          <DatePicker format={(value) => `${value.format('DD/MM/YYYY')}`} style={{ width: '100%' }} />
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
        {schoolOptionVal && <p>{getAddressFromSchool(schoolOptionVal)}</p>}
        <Form.Item
          label={'Number of learners attending'}
          field="StudentsNum"
          rules={[{ required: true, message: 'required' }]}
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
        >
          <Select
            allowClear
            options={teacherList.map((it) => ({
              label: it.DeliverySpecialist,
              value: it.Id,
            }))}
            placeholder="please enter"
          />
        </Form.Item>
        <Form.Item
          label={'Payment Status'}
          field="PaymentStatus"
        >
          <Select
            allowClear
            options={['Paid', 'Partially Paid', 'Unpaid']}
            placeholder="Select payment status"
          />
        </Form.Item>
        <Form.Item style={{ textAlign: 'center' }}>
          <Space>
            <Button loading={loading} type="primary" htmlType="submit">
              {'Submit'}
            </Button>
            <Button onClick={handleCancel}>{'Cancel'}</Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}

export default UpdateForm;
