import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  Notification,
  Tag,
  Card,
  Statistic,
} from '@arco-design/web-react';
import * as services from '@/services';
import SchoolForm from './SchoolForm';
import {
  IconPlus,
  IconRefresh,
  IconSearch,
} from '@arco-design/web-react/icon';
import Row from '@arco-design/web-react/es/Grid/row';
import Col from '@arco-design/web-react/es/Grid/col';
import useForm from '@arco-design/web-react/es/Form/useForm';
import debounce from 'lodash/debounce';
import moment from 'moment';
import { initialPaginationState, getPaginationConfig, PaginationState } from './coursesHelper';

const SchoolList = () => {
  const [schoolList, setSchoolList] = useState([]);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [form] = useForm();
  const [rowData, setRow] = useState<any>({});
  const [pagination, setPagination] = useState<PaginationState>(initialPaginationState);

  useEffect(() => {
    fetchSchoolLists();
  }, []);

  const fetchSchoolLists = async (data = {}) => {
    setLoading(true);
    try {
      const res = await services.g.getSchool(data);
      setSchoolList(res?.data || []);
      setPagination(prev => ({ ...prev, total: res?.data?.length || 0 }));
    } catch (error) {
      console.error('Failed to load schools:', error);
      Notification.error({
        title: 'Error',
        content: 'Failed to load schools. Please try again.',
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

  const columns = [
    {
      title: 'School Number',
      dataIndex: 'SchoolNumber',
      key: 'SchoolNumber',
      width: 130,
      fixed: 'left',
      sorter: (a, b) => a.SchoolNumber - b.SchoolNumber,
      render: (num) => (
        <Tag color="arcoblue" style={{ fontFamily: 'monospace', fontSize: '13px' }}>
          #{num}
        </Tag>
      ),
    },
    {
      title: 'School Name',
      dataIndex: 'SchoolName',
      key: 'SchoolName',
      width: 220,
      fixed: 'left',
      sorter: (a, b) => (a.SchoolName || '').localeCompare(b.SchoolName || ''),
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'City',
      dataIndex: 'City',
      key: 'City',
      width: 120,
      sorter: (a, b) => (a.City || '').localeCompare(b.City || ''),
    },
    {
      title: 'School Type',
      dataIndex: 'SchoolType',
      key: 'SchoolType',
      width: 180,
      ellipsis: true,
      sorter: (a, b) => (a.SchoolType || '').localeCompare(b.SchoolType || ''),
      render: (text) => text ? <Tag color="blue">{text}</Tag> : '-',
    },
    {
      title: 'Telephone',
      dataIndex: 'Telephone',
      key: 'Telephone',
      width: 130,
    },
    {
      title: 'Email',
      dataIndex: 'Email',
      key: 'Email',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Street',
      dataIndex: 'Street',
      key: 'Street',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Suburb',
      dataIndex: 'Suburb',
      key: 'Suburb',
      width: 120,
      ellipsis: true,
    },
    {
      title: 'Address',
      dataIndex: 'PostalAddress1',
      key: 'PostalAddress1',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Website',
      dataIndex: 'SchoolWebsite',
      key: 'SchoolWebsite',
      width: 150,
      ellipsis: true,
      render: (url) => url ? (
        <a href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      ) : '-',
    },
    {
      title: 'Created',
      dataIndex: 'CreateDate',
      key: 'CreateDate',
      width: 110,
      sorter: (a, b) => {
        const dateA = a.CreateDate ? new Date(a.CreateDate).getTime() : 0;
        const dateB = b.CreateDate ? new Date(b.CreateDate).getTime() : 0;
        return dateA - dateB;
      },
      render: (date) => date ? moment(date).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Last Updated',
      dataIndex: 'UpdateDate',
      key: 'UpdateDate',
      width: 150,
      sorter: (a, b) => {
        const dateA = a.UpdateDate ? new Date(a.UpdateDate).getTime() : 0;
        const dateB = b.UpdateDate ? new Date(b.UpdateDate).getTime() : 0;
        return dateA - dateB;
      },
      render: (date) => date ? moment(date).format('DD/MM/YY HH:mm') : '-',
    },
    {
      title: 'Operation',
      dataIndex: 'Operation',
      fixed: 'right',
      width: 160,
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
            content={`Are you sure you want to delete "${record.SchoolName}"?`}
            onOk={() => handleDelete(record.SchoolNumber, record.SchoolName)}
          >
            <Button
              type="primary"
              status="danger"
              size="mini"
              loading={deleteLoading === record.SchoolNumber}
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
    fetchSchoolLists(values);
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
    fetchSchoolLists();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDelete = async (id: number, name: string) => {
    setDeleteLoading(id);
    try {
      const res = await services.course.deleteSchool({ id });
      if (res?.data) {
        Notification.success({
          title: 'Success',
          content: `School "${name}" has been deleted successfully.`,
          duration: 3000,
        });
        fetchSchoolLists();
      }
    } catch (error) {
      console.error('Failed to delete school:', error);
      Notification.error({
        title: 'Deletion Failed',
        content: 'Failed to delete school. Please try again.',
        duration: 5000,
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: '20px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Schools"
              value={schoolList.length}
              precision={0}
              countUp
              styleValue={{ color: '#165DFF' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Schools with Email"
              value={schoolList.filter(s => s.Email).length}
              precision={0}
              countUp
              styleValue={{ color: '#00B42A' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Schools with Website"
              value={schoolList.filter(s => s.SchoolWebsite).length}
              precision={0}
              countUp
              styleValue={{ color: '#FF7D00' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search and Actions */}
      <Card
        style={{ marginBottom: '16px' }}
        bordered={false}
        bodyStyle={{ padding: '16px 20px' }}
      >
        <Form
          form={form}
          labelAlign="left"
          layout="inline"
        >
          <Row justify="space-between" align="center" style={{ width: '100%' }}>
            <Space wrap>
              <Form.Item label="School Name" field="SchoolName" style={{ marginBottom: 0 }}>
                <Input
                  onKeyDown={handleKeyDown}
                  onChange={debouncedSearch}
                  allowClear
                  placeholder="Search by school name..."
                  style={{ width: '250px' }}
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
            <Button type="primary" icon={<IconPlus />} onClick={handleAdd} size="large">
              Add School
            </Button>
          </Row>
        </Form>
      </Card>

      {/* Table */}
      <Card bordered={false}>
        <Table
          rowKey={'SchoolNumber'}
          columns={columns}
          data={schoolList}
          loading={loading}
          scroll={{ x: 1800 }}
          pagination={getPaginationConfig(pagination, setPagination)}
          border={{
            wrapper: true,
            cell: true,
          }}
          stripe
        />
      </Card>
      <Modal
        title={
          <div style={{ fontSize: '18px', fontWeight: 600 }}>
            {rowData?.SchoolNumber ? 'Edit School' : 'Add New School'}
          </div>
        }
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        style={{ maxWidth: '900px', width: '90%' }}
      >
        <SchoolForm
          rowData={rowData}
          onOk={(schoolName) => {
            setVisible(false);
            handleSearch();
            Notification.success({
              title: 'Success',
              content: `School "${schoolName}" has been ${rowData?.SchoolNumber ? 'updated' : 'created'} successfully.`,
              duration: 3000,
            });
          }}
          onCancel={() => { setVisible(false); }}
        />
      </Modal>
    </div>
  );
};

export default SchoolList;
