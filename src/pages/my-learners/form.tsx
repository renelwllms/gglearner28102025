import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Message,
  Modal,
  Grid,
  Space,
} from '@arco-design/web-react';
import { GlobalContext } from '@/context';
import useLocale from '@/utils/useLocale';
import { IconPlus, IconRefresh, IconSearch } from '@arco-design/web-react/icon';
import styles from './index.module.less';
import AddForm from '../Learner/form';
import { useSelector } from 'react-redux';
import * as services from '@/services';
import { debounce } from 'lodash';


const { Row, Col } = Grid;
const { useForm } = Form;
interface SearchFormProps {
  onSearch: (values: Record<string, any>) => void;
  allowStatusFilter?: boolean; // optional
  allowLastCommFilter?: boolean;
  allowStudentTypeFilter?: boolean; // optional
}

const Option = Select.Option;

function SearchForm({ onSearch, allowStatusFilter = false, allowLastCommFilter = false, allowStudentTypeFilter = false }: SearchFormProps) {
  const [form] = useForm();
  const token = useSelector((state: any) => state.token);
  const [addVisible, setAddVisible] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [courseOption, setCourse] = useState([]);
  const [unitStandards, setUnitStandards] = useState([]);

  const handleSubmit = () => {
    const values = form.getFieldsValue();
    onSearch(values);
  };

  // Create debounced search function
  const debouncedSearch = useCallback(
    debounce((values) => {
      onSearch(values);
    }, 500),
    [onSearch]
  );

  useEffect(() => {
    if (token) {
      getOptions();
      fetchUnits();
    }
  }, [token]);

  const handleReset = () => {
    form.resetFields();
    onSearch({
      School: void 0,
      name: void 0,
    });
  };

  const handleInputChange = () => {
    const values = form.getFieldsValue();
    debouncedSearch(values);
  };
  const handleAdd = () => {
    window.open('https://forms.office.com/r/JskAWkiQAK');
    /*window.open('https://forms.office.com/r/Uy4i31KrM1');*/
  };

  const handleAddCancel = () => {
    setAddVisible(false);
    form.resetFields();
  }


  const getOptions = (data = {}) => {
    services.g.getCourse({}).then((res) => {
      setCourse(res?.data || []);
      console.log("res?.data.filter(x=> x.IsCustom == true)");
    });
  };


  const fetchUnits = async (data = {}) => {
    services.course.getUnits(data).then((res) => {
      setUnitStandards(res?.data || []);
    });
  };

  const handleStudentSubmit = (values) => {
    setAddLoading(true);
    const { FirstName, LastName, SchoolName, Gender, DOB, Email, Ethnicity } =
      values;

    services.g
      .addStudent({
        FirstName,
        LastName,
        SchoolName: SchoolName?.label,
        SchoolNumber: SchoolName?.value,
        Gender,
        DOB,
        Email,
        Ethnicity,
      })
      .then((res) => {
        if (res?.data) {
          setAddVisible(false);
          Message.success('success');
          form.resetFields();
          handleSubmit();
        }
      })
      .finally(() => {
        setAddLoading(false);
      });
  };


  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      console.log("enter");
      handleSubmit();
    }
  }



  const onChangeCourse = (value) => {

  };

  return (
    <div>
      <Form
        form={form}
        className={styles['search-form']}
        labelAlign="left"
        layout="vertical"
        style={{
          marginBottom: '16px',
        }}
      >
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Form.Item label="Learner Name" field="name" style={{ marginBottom: 0 }}>
              <Input
                allowClear
                onKeyUp={handleKeyDown}
                onChange={handleInputChange}
                placeholder="Enter name"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Form.Item label="School Name" field="School" style={{ marginBottom: 0 }}>
              <Input
                allowClear
                onKeyUp={handleKeyDown}
                onChange={handleInputChange}
                placeholder="Enter school"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Form.Item label="Course" field="CourseID" style={{ marginBottom: 0 }}>
              <Select
                allowCreate
                showSearch
                allowClear
                placeholder="Select course"
                options={courseOption.map((it) => ({
                  label: it.CourseName,
                  value: it.CourseID,
                }))}
                filterOption={(inputValue, option) =>
                  option.props.children
                    .toLowerCase()
                    .includes(inputValue.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Form.Item label="Unit Standards" field="UnitStandardID" style={{ marginBottom: 0 }}>
              <Select
                placeholder="Select unit"
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
            </Form.Item>
          </Col>
          {allowStatusFilter && (
            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
              <Form.Item label="Learner Status" field="AllStatus" style={{ marginBottom: 0 }}>
                <Select
                  mode="multiple"
                  allowClear
                  options={[
                    { label: 'On Going', value: 'On Going' },
                    { label: 'Withdrawn', value: 'Withdrawn' },
                    { label: 'Did Not Complete', value: 'Did Not Complete' },
                    { label: 'Completed', value: 'Completed' },
                    { label: 'Other', value: 'Other' },
                  ]}
                  placeholder="Select statuses"
                  maxTagCount={2}
                />
              </Form.Item>
            </Col>
          )}
          {allowLastCommFilter && (
            <Col xs={24} sm={12} md={8} lg={5} xl={3}>
              <Form.Item label="Last Comm Date" field="lastCommDate" style={{ marginBottom: 0 }}>
                <DatePicker format={(value) => `${value.format('DD/MM/YYYY')}`} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          )}
          {allowLastCommFilter && (
            <Col xs={24} sm={12} md={8} lg={5} xl={3}>
              <Form.Item label="Enrollment Type" field="learnerType" style={{ marginBottom: 0 }}>
                <Select defaultValue="all">
                  <Option value=""></Option>
                  <Option value="1">Remote</Option>
                  <Option value="2">Workshop</Option>
                </Select>
              </Form.Item>
            </Col>
          )}
          <Col xs={24} sm={24} md={16} lg={10} xl={6} style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Space wrap style={{ marginBottom: 0 }}>
              <Button type="primary" icon={<IconSearch />} onClick={handleSubmit}>
                Search
              </Button>
              <Button icon={<IconRefresh />} onClick={handleReset}>
                Reset
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  setAddVisible(true);
                }}
              >
                Add Student
              </Button>
              <Button type="primary" icon={<IconPlus />} onClick={handleAdd}>
                Register
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
      <Modal
        title="Add"
        visible={addVisible}
        footer={null}
        onCancel={handleAddCancel}
        autoFocus={false}
        focusLock={true}
        unmountOnExit={true}
        style={{ width: '800px' }}
      >
        <AddForm
          form={form}
          handleSubmit={handleStudentSubmit}
          loading={addLoading}
          handleCancel={handleAddCancel}
        ></AddForm>
      </Modal>
    </div>
  );
}

export default SearchForm;
