import React, { useContext, useEffect, useState, useRef } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Grid,
  Space,
} from '@arco-design/web-react';
import { IconRefresh, IconSearch } from '@arco-design/web-react/icon';
import styles from './index.module.less';
import { useSelector } from 'react-redux';
import * as services from '@/services';
import debounce from 'lodash/debounce';
const { Row, Col } = Grid;
const { useForm } = Form;

function SearchForm(props: {
  onSearch: (values: Record<string, any>) => void;
}) {
  const [form] = useForm();
  const token = useSelector((state: any) => state.token);
  const [courseOption, setCourse] = useState([]);
  const [schoolOption, setSchoolOption] = useState([]);
  const [schoolOptionVal, setSchoolOptionVal] = useState({SchoolNumber:0});
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Create a debounced search function
  const debouncedSearch = useRef(
    debounce((values: Record<string, any>) => {
      props.onSearch({...values, schoolOptionVal: schoolOptionVal?.SchoolNumber});
      setIsDebouncing(false);
    }, 500)
  ).current;

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    if (token) {
      getOptions();
    }
  }, [token]);

  const getOptions = () => {
    services.g.getCourse({}).then((res) => {
      setCourse(res?.data || []);
    });
    services.g.getSchool({}).then((res) => {
      setSchoolOption(res?.data || []);
    });
  };

  const handleSubmit = (values) => {
    props.onSearch({...values,schoolOptionVal : schoolOptionVal?.SchoolNumber});
  };

  const handleInputChange = () => {
    setIsDebouncing(true);
    const values = form.getFieldsValue();
    debouncedSearch({...values, schoolOptionVal: schoolOptionVal?.SchoolNumber});
  };

  const handleReset = () => {
    debouncedSearch.cancel();
    setIsDebouncing(false);
    form.resetFields();
    props.onSearch({});
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      debouncedSearch.cancel();
      setIsDebouncing(false);
      form.submit();
    }
  }

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
        onSubmit={handleSubmit}
      >
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} md={8} lg={6} xl={5}>
            <Form.Item label="Workshop Name" field="CourseID" style={{ marginBottom: 0 }}>
              <Select
                labelInValue
                showSearch
                allowClear
                filterOption={(inputValue, option) =>
                  option.props.value?.label
                    ?.toLowerCase()
                    .indexOf(inputValue.toLowerCase()) >= 0 ||
                  option.props?.children
                    .toLowerCase()
                    .indexOf(inputValue.toLowerCase()) >= 0
                }
                options={courseOption.map((it) => ({
                  label: it.CourseName,
                  value: it.CourseID,
                }))}
                placeholder="Select workshop"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Form.Item label="Workshop Code" field="Code" style={{ marginBottom: 0 }}>
              <Input
                onKeyDown={handleKeyDown}
                onChange={handleInputChange}
                allowClear
                placeholder="Enter code"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={5}>
            <Form.Item label="School Name" field="SchoolName" style={{ marginBottom: 0 }}>
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
                placeholder="Select school"
                onChange={(e) => {
                  if (!e) {
                    setSchoolOptionVal(null);
                    return;
                  }
                  const filterOpt = schoolOption.filter((opt) => opt.SchoolNumber == e.value);
                  if (filterOpt.length > 0) {
                    setSchoolOptionVal(filterOpt[0]);
                  }
                  else {
                    setSchoolOptionVal(null);
                  }
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4} style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Space wrap style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                icon={<IconSearch />}
                onClick={() => {
                  form.submit();
                }}
              >
                Search
              </Button>
              <Button icon={<IconRefresh />} onClick={handleReset}>
                Reset
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </div>
  );
}

export default SearchForm;
