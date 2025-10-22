import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Notification,
  Popconfirm,
  Select,
  Typography,
} from '@arco-design/web-react';
import { commService } from '@/services/communication';
import DataAddForm from './EmailTemplateForm';
import {
  IconPlus,
  IconRefresh,
  IconSearch,
} from '@arco-design/web-react/icon';
import Row from '@arco-design/web-react/es/Grid/row';
import useForm from '@arco-design/web-react/es/Form/useForm';
import debounce from 'lodash/debounce';
import { initialPaginationState, getPaginationConfig, PaginationState } from './coursesHelper';
import { useSelector } from 'react-redux';

const EmailList = () => {
  const [dataList, setDataList] = useState([]);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [form] = useForm();
  const [rowData, setRow] = useState<any>({});
  const [pagination, setPagination] = useState<PaginationState>(initialPaginationState);
  const token = useSelector((state: any) => state.token);
  const isMountedRef = React.useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    if (token) {
      fetchLists();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [token]);

  const fetchLists = async (data = {}) => {
    if (!isMountedRef.current) return;

    setLoading(true);
    try {
      const res = await commService.getAllTemplateList(data);
      console.log('Email template response:', res);

      if (!isMountedRef.current) return;

      if (res?.code === 0 || res?.data) {
        setDataList(res?.data || []);
        setPagination(prev => ({ ...prev, total: res?.data?.length || 0 }));
      } else {
        console.warn('Unexpected response structure:', res);
        setDataList([]);
      }
    } catch (error) {
      console.error('Failed to load email templates - Full error:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response,
        status: error?.response?.status
      });

      if (!isMountedRef.current) return;

      Notification.error({
        title: 'Error',
        content: `Failed to load email templates: ${error?.message || 'Unknown error'}`,
        duration: 5000,
      });
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleAdd = () => {
    setRow({});
    setVisible(true);
  };

  const handleEdit = (row) => {
    setRow(row);
    setVisible(true);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'Name',
      key: 'Name',
      width: 200,
    },
    {
      title: 'Category',
      dataIndex: 'Category',
      key: 'Category',
      width: 120,
      render: (category) => category || 'General',
    },
    {
      title: 'Subject',
      dataIndex: 'Subject',
      key: 'Subject',
      width: 250,
      render: (text) => (
        <Typography.Text ellipsis={{ rows: 1, showTooltip: true }}>
          {text}
        </Typography.Text>
      ),
    },
    {
      title: 'Template',
      dataIndex: 'Template',
      key: 'Template',
      render: (text) => (
        <Typography.Text
          ellipsis={{
            rows: 2,
            expandable: true,
            symbol: 'more',
          }}
          style={{ maxWidth: '400px' }}
        >
          {text}
        </Typography.Text>
      ),
    },
    {
      title: 'Operation',
      dataIndex: 'Operation',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="mini"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(record);
            }}
          >
            Edit
          </Button>
          <Popconfirm
            focusLock
            title="Confirm Deletion"
            content={`Are you sure you want to delete template "${record.Name}"?`}
            onOk={() => handleDelete(record.id, record.Name)}
          >
            <Button
              type="primary"
              status="danger"
              size="mini"
              loading={deleteLoading === record.id}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleDelete = async (id: number, name: string) => {
    setDeleteLoading(id);
    try {
      const res = await commService.deleteEmailTemplate({ id });
      if (res?.data) {
        Notification.success({
          title: 'Success',
          content: `Email template "${name}" has been deleted successfully.`,
          duration: 3000,
        });
        fetchLists();
      }
    } catch (error) {
      console.error('Failed to delete email template:', error);
      Notification.error({
        title: 'Deletion Failed',
        content: 'Failed to delete email template. Please try again.',
        duration: 5000,
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSearch = () => {
    const values = form.getFieldsValue();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchLists(values);
  };

  const debouncedSearch = useMemo(
    () => debounce(() => {
      handleSearch();
    }, 500),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleReset = () => {
    form.resetFields();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchLists();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  if (!token) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Please log in to access email templates.</p>
      </div>
    );
  }

  return (
    <div>
      <Form
        form={form}
        labelAlign="left"
        layout="inline"
        style={{
          marginBottom: '10px',
        }}
      >
        <Row justify="space-between" align="center" style={{ width: '100%' }}>
          <Space wrap>
            <Form.Item label="Name" field="Name">
              <Input
                onKeyDown={handleKeyDown}
                onChange={debouncedSearch}
                allowClear
                placeholder="Search by name"
                style={{ width: 200 }}
              />
            </Form.Item>
            <Form.Item label="Category" field="Category">
              <Select
                onChange={debouncedSearch}
                allowClear
                placeholder="All categories"
                style={{ width: 150 }}
                options={[
                  { label: 'All', value: '' },
                  { label: 'General', value: 'General' },
                  { label: 'Welcome', value: 'Welcome' },
                  { label: 'Reminder', value: 'Reminder' },
                  { label: 'Follow-up', value: 'Follow-up' },
                  { label: 'Invoice', value: 'Invoice' },
                  { label: 'Completion', value: 'Completion' },
                ]}
              />
            </Form.Item>
            <Space>
              <Button type="primary" icon={<IconSearch />} onClick={handleSearch}>
                Search
              </Button>
              <Button icon={<IconRefresh />} onClick={handleReset}>
                Reset
              </Button>
            </Space>
          </Space>
          <Button type="primary" icon={<IconPlus />} onClick={handleAdd}>
            Add Template
          </Button>
        </Row>
      </Form>

      <Table
        rowKey={'id'}
        columns={columns}
        data={dataList}
        loading={loading}
        pagination={getPaginationConfig(pagination, setPagination)}
      />
      <Modal
        title={rowData?.id ? 'Edit Template' : 'Add Template'}
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
      >
        <DataAddForm
          rowData={rowData}
          onOk={(templateName) => {
            setVisible(false);
            handleSearch();
            Notification.success({
              title: 'Success',
              content: `Email template "${templateName}" has been ${rowData?.id ? 'updated' : 'created'} successfully.`,
              duration: 3000,
            });
          }}
          onCancel={() => { setVisible(false); }}
        />
      </Modal>
    </div>
  );
};

export default EmailList;
