import React, { useContext } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Grid,
  Space,
} from '@arco-design/web-react';
import { GlobalContext } from '@/context';
import useLocale from '@/utils/useLocale';
import { IconPlus, IconRefresh, IconSearch } from '@arco-design/web-react/icon';
import styles from './index.module.less';

const { Row, Col } = Grid;
const { useForm } = Form;

function SearchForm(props: {
  onSearch: (values: Record<string, any>) => void;
}) {
  const [form] = useForm();

  const handleSubmit = () => {
    const values = form.getFieldsValue();
    props.onSearch(values);
  };

  const handleReset = () => {
    form.resetFields();
    props.onSearch({
      School: void 0,
      name: void 0,
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSubmit();
    }
  }

  return (
    <div>
      <Form
        form={form}
        className={styles['search-form']}
        labelAlign="left"
        layout="inline"
        style={{
          display: 'inline-block',
          marginBottom: '10px',
        }}
      >
        <Row>
          <Form.Item label={'Learner Name'} field="name">
            <Input allowClear onKeyDown={handleKeyDown} placeholder={'Please enter the Learner Name'} />
          </Form.Item>
          <Form.Item label={'School Name'} field="School">
            <Input allowClear onKeyDown={handleKeyDown} placeholder={'Please enter the School Name'} />
          </Form.Item>
          <Space>
            <Button type="primary" icon={<IconSearch />} onClick={handleSubmit}>
              {'Search'}
            </Button>
            <Button icon={<IconRefresh />} onClick={handleReset}>
              {'Reset'}
            </Button>
          </Space>
        </Row>
      </Form>
    </div>
  );
}

export default SearchForm;
