import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Checkbox,
  Notification,
  Popconfirm,
} from '@arco-design/web-react';
import { adminUser } from '@/services/adminUser';
import DataAddForm from './AdminUserForm';
import {
  IconPlus,
  IconRefresh,
  IconSearch,
} from '@arco-design/web-react/icon';
import Row from '@arco-design/web-react/es/Grid/row';
import useForm from '@arco-design/web-react/es/Form/useForm';
import debounce from 'lodash/debounce';
import { initialPaginationState, getPaginationConfig, PaginationState } from './coursesHelper';

const AdminUserList = () => {
  const [dataList, setDataList] = useState([]);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [form] = useForm();
  const [rowData, setRow] = useState<any>({});
  const [pagination, setPagination] = useState<PaginationState>(initialPaginationState);

  useEffect(() => {
    fetchDataLists();
  }, []);

  const fetchDataLists = async (data = {}) => {
    setLoading(true);
    try {
      const res = await adminUser.getAll(data);
      setDataList(res?.data || []);
      setPagination(prev => ({ ...prev, total: res?.data?.length || 0 }));
    } catch (error) {
      console.error('Failed to load users:', error);
      Notification.error({
        title: 'Error',
        content: 'Failed to load users. Please try again.',
        duration: 5000,
      });
    } finally {
      setLoading(false);
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

  const handleDelete = async (id: number, name: string) => {
    setDeleteLoading(id);
    try {
      const res = await adminUser.delete({ id });
      if (res?.data) {
        Notification.success({
          title: 'Success',
          content: `User "${name}" has been deleted successfully.`,
          duration: 3000,
        });
        fetchDataLists();
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      Notification.error({
        title: 'Deletion Failed',
        content: 'Failed to delete user. Please try again.',
        duration: 5000,
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'Name',
      key: 'Name',
    },
    {
      title: 'Email',
      dataIndex: 'Email',
      key: 'Email',
    },
    {
      title: 'Role',
      dataIndex: 'UserRole',
      key: 'UserRole',
      render: (role) => (
        <span style={{
          fontWeight: role === 'Admin' ? 'bold' : 'normal',
          color: role === 'Admin' ? '#165DFF' : '#4E5969'
        }}>
          {role || 'User'}
        </span>
      )
    },
    {
      title: 'Active',
      dataIndex: 'IsActive',
      render: (_, record) => (
        <Checkbox checked={record.IsActive} aria-readonly />
      )
    },
    {
      title: 'Operation',
      dataIndex: 'Operation',
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
            content={`Are you sure you want to delete user "${record.Name}"?`}
            onOk={() => handleDelete(record.Id, record.Name)}
          >
            <Button
              type="primary"
              status="danger"
              size="mini"
              loading={deleteLoading === record.Id}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleSearch = () => {
    const values = form.getFieldsValue();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchDataLists(values);
  };

  const debouncedSearch = useMemo(
    () => debounce(() => {
      handleSearch();
    }, 500),
    []
  );

  const handleReset = () => {
    form.resetFields();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchDataLists();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

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
                placeholder="Please enter"
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
            Add
          </Button>
        </Row>
      </Form>

      <Table
        rowKey={'Id'}
        columns={columns}
        data={dataList}
        loading={loading}
        pagination={getPaginationConfig(pagination, setPagination)}
      />
      <Modal
        title={rowData?.Id ? 'Edit User' : 'Add User'}
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
      >
        <DataAddForm
          rowData={rowData}
          onOk={(userName) => {
            setVisible(false);
            handleSearch();
            Notification.success({
              title: 'Success',
              content: `User "${userName}" has been ${rowData?.Id ? 'updated' : 'created'} successfully.`,
              duration: 3000,
            });
          }}
          onCancel={() => { setVisible(false); }}
        />
      </Modal>
    </div>
  );
};

export default AdminUserList;
