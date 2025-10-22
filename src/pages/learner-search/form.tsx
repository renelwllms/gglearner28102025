import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
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
import * as services from '@/services';
import { teacher } from '@/services/teacher';
import debounce from 'lodash/debounce';

const { Row, Col } = Grid;
const { useForm } = Form;

function SearchForm(props: {
  onSearch: (values: Record<string, any>) => void;
}) {
  const [form] = useForm();
  const [addVisible, setAddVisible] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [tutorOptions, setTutorOptions] = useState([]);

  // Create a debounced search function
  const debouncedSearch = useRef(
    debounce((values: Record<string, any>) => {
      props.onSearch(values);
      setIsDebouncing(false);
    }, 500)
  ).current;

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Load tutor options on mount
  useEffect(() => {
    teacher.getAll({}).then((res) => {
      setTutorOptions(res?.data || []);
    }).catch((err) => {
      console.error('Failed to load tutors:', err);
    });
  }, []);

  const handleSubmit = () => {
    const values = form.getFieldsValue();
    props.onSearch(values);
  };

  const handleInputChange = () => {
    // Remove auto-search on input change to prevent focus issues
    // Users can press Enter or click Search button instead
  };

  const handleSelectChange = () => {
    // Immediate search for dropdown changes (no debounce)
    const values = form.getFieldsValue();
    props.onSearch(values);
  };

  const handleReset = () => {
    debouncedSearch.cancel();
    setIsDebouncing(false);
    form.resetFields();
    props.onSearch({
      School: void 0,
      name: void 0,
      LearnerStatus: void 0,
      AssignedTo: void 0,
      Tutor: void 0,
    });
  };
  const handleAdd = () => {
    window.open('https://forms.office.com/r/JskAWkiQAK');
    /*window.open('https://forms.office.com/r/Uy4i31KrM1');*/
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      debouncedSearch.cancel();
      setIsDebouncing(false);
      handleSubmit();
    }
  }

  const handleAddCancel = () => {
    setAddVisible(false);
    form.resetFields();
  }


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

  return (
    <div>
      <Form
        form={form}
        className={styles['search-form']}
        labelAlign="left"
        layout="vertical"
        autoComplete="off"
        style={{
          marginBottom: '16px',
        }}
      >
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Form.Item label="Learner Name" field="name" style={{ marginBottom: 0 }}>
              <Input
                allowClear
                onKeyDown={handleKeyDown}
                placeholder="Enter name"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Form.Item label="School Name" field="School" style={{ marginBottom: 0 }}>
              <Input
                allowClear
                onKeyDown={handleKeyDown}
                placeholder="Enter school"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={5} xl={4}>
            <Form.Item label="Status" field="LearnerStatus" style={{ marginBottom: 0 }}>
              <Select
                placeholder="Select status"
                allowClear
                onChange={handleSelectChange}
                options={[
                  { label: 'On Going', value: 'On Going' },
                  { label: 'Completed', value: 'Completed' },
                  { label: 'Withdrawn', value: 'Withdrawn' },
                  { label: 'Did Not Complete', value: 'Did Not Complete' },
                  { label: 'Other', value: 'Other' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={5} xl={3}>
            <Form.Item label="Assigned To" field="AssignedTo" style={{ marginBottom: 0 }}>
              <Select
                placeholder="Assignment"
                allowClear
                onChange={handleSelectChange}
                options={[
                  { label: 'School', value: 'School' },
                  { label: 'GET Group', value: 'GET Group' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={5} xl={4}>
            <Form.Item label="Teacher" field="Tutor" style={{ marginBottom: 0 }}>
              <Select
                placeholder="Select teacher"
                allowClear
                showSearch
                onChange={handleSelectChange}
                options={tutorOptions.map((it) => ({
                  label: it.DeliverySpecialist,
                  value: it.DeliverySpecialist,
                }))}
                filterOption={(inputValue, option) =>
                  option.label?.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                }
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={7} xl={5} style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Space wrap style={{ marginBottom: 0 }}>
              <Button type="primary" icon={<IconSearch />} onClick={handleSubmit}>
                Search
              </Button>
              <Button icon={<IconRefresh />} onClick={handleReset}>
                Reset
              </Button>
              <Button
                onClick={() => {
                  setAddVisible(true);
                }}
              >
                Add Student
              </Button>
              <Button icon={<IconPlus />} onClick={handleAdd}>
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
