import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  Input,
  Space,
  Popconfirm,
  Notification,
  Descriptions,
  Statistic,
  Grid,
  Card,
  Empty,
} from '@arco-design/web-react';
import * as services from '@/services';
import UnitEditForm from './UnitEditForm';
import {
  IconDown,
  IconPlus,
  IconRefresh,
  IconRight,
  IconSearch,
  IconFile,
  IconCopy,
  IconDownload,
} from '@arco-design/web-react/icon';
import Row from '@arco-design/web-react/es/Grid/row';
import useForm from '@arco-design/web-react/es/Form/useForm';
import debounce from 'lodash/debounce';
import { initialPaginationState, getPaginationConfig, PaginationState } from './coursesHelper';
import { exportUnitStandardsToExcel } from './exportUtils';

const { Col } = Grid;

const UnitManagement = () => {
  const [units, setUnits] = useState([]);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [form] = useForm();
  const [rowData, setRow] = useState<any>({});
  const [pagination, setPagination] = useState<PaginationState>(initialPaginationState);

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    setDeleteLoading(id);
    try {
      const res = await services.course.deleteUnitStandard({ id });
      if (res?.data) {
        Notification.success({
          title: 'Success',
          content: `Unit Standard "${name}" has been deleted successfully.`,
          duration: 3000,
        });
        fetchUnits();
      }
    } catch (error) {
      console.error('Failed to delete unit standard:', error);
      Notification.error({
        title: 'Deletion Failed',
        content: 'Failed to delete unit standard. Please try again.',
        duration: 5000,
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  const fetchUnits = async (data = {}) => {
    setLoading(true);
    try {
      const res = await services.course.getUnits(data);
      setUnits(res?.data || []);
      setPagination(prev => ({ ...prev, total: res?.data?.length || 0 }));
    } catch (error) {
      console.error('Failed to load unit standards:', error);
      Notification.error({
        title: 'Error',
        content: 'Failed to load unit standards. Please try again.',
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

  // Duplicate/Clone unit standard
  const handleDuplicate = (unit) => {
    const duplicatedUnit = {
      ...unit,
      US: `${unit.US}-COPY`,
      USName: `${unit.USName} (Copy)`,
      UnitStandardID: undefined, // Remove ID so it creates new
    };
    setRow(duplicatedUnit);
    setVisible(true);
  };

  // Export to Excel
  const handleExport = async () => {
    try {
      await exportUnitStandardsToExcel(units);
      Notification.success({
        title: 'Export Successful',
        content: `${units.length} unit standards exported to Excel`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Export error:', error);
      Notification.error({
        title: 'Export Failed',
        content: 'Failed to export unit standards. Please try again.',
        duration: 3000,
      });
    }
  };

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalUnits = units.length;
    const level1Count = units.filter(u => u.USLevel === 1).length;
    const level2Count = units.filter(u => u.USLevel === 2).length;
    const level3Count = units.filter(u => u.USLevel === 3).length;
    const totalCredits = units.reduce((sum, u) => sum + (parseInt(u.USCredits) || 0), 0);
    const avgCredits = totalUnits > 0 ? Math.round(totalCredits / totalUnits) : 0;

    return {
      totalUnits,
      level1Count,
      level2Count,
      level3Count,
      totalCredits,
      avgCredits,
    };
  }, [units]);

  const columns = [
    {
      title: 'Unit Standard',
      dataIndex: 'US',
      key: 'US',
    },
    {
      title: 'Unit Standard Name',
      dataIndex: 'USName',
      key: 'USName',
    },
    {
      title: 'Description',
      dataIndex: 'USDescription',
      key: 'USDescription',
    },
    {
      title: 'Level',
      dataIndex: 'USLevel',
      key: 'USLevel',
    },
    {
      title: 'Credits',
      dataIndex: 'USCredits',
      key: 'USCredits',
    },
    {
      title: 'Version',
      dataIndex: 'USVersion',
      key: 'USVersion',
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
          <Button
            size="mini"
            type="secondary"
            icon={<IconCopy />}
            onClick={(e) => {
              e.stopPropagation();
              handleDuplicate(record);
            }}
          >
            Duplicate
          </Button>
          <Popconfirm
            focusLock
            title="Confirm Deletion"
            content={`Are you sure you want to delete "${record.USName}"?`}
            onOk={() => handleDelete(record.UnitStandardID, record.USName)}
          >
            <Button
              type="primary"
              status="danger"
              size="mini"
              loading={deleteLoading === record.UnitStandardID}
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
    fetchUnits(values);
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
    fetchUnits();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRowRender = (row) => {
    const infoData = [
      {
        label: 'Classification',
        value: row?.USClassification,
      },
      {
        label: 'URL',
        value: row?.USURL ? (
          <a href={row?.USURL} target="_blank" rel="noopener noreferrer">
            {row?.USURL}
          </a>
        ) : (
          ''
        ),
      },
      {
        label: 'Available Grade',
        value: row?.USAvailableGrade,
      },
    ];

    return (
      <Descriptions
        layout="inline-horizontal"
        column={1}
        border
        data={infoData}
      />
    );
  };

  return (
    <div>
      {/* Statistics Dashboard */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Unit Standards"
              value={statistics.totalUnits}
              prefix={<IconFile />}
              styleValue={{ color: '#0FC6C2' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Level 1-2 Units"
              value={statistics.level1Count + statistics.level2Count}
              groupSeparator
              styleValue={{ color: '#165DFF' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Credits"
              value={statistics.totalCredits}
              suffix="credits"
              styleValue={{ color: '#722ED1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Average Credits"
              value={statistics.avgCredits}
              suffix="per unit"
              styleValue={{ color: '#F77234' }}
            />
          </Card>
        </Col>
      </Row>

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
            <Form.Item label="Unit Standard" field="name">
              <Input
                onKeyDown={handleKeyDown}
                onChange={debouncedSearch}
                allowClear
                placeholder="Please enter"
              />
            </Form.Item>
            <Form.Item label="Level" field="USLevel">
              <InputNumber
                onKeyDown={handleKeyDown}
                onChange={debouncedSearch}
                placeholder="Please enter"
              />
            </Form.Item>
            <Form.Item label="Credits" field="USCredits">
              <InputNumber
                onKeyDown={handleKeyDown}
                onChange={debouncedSearch}
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
          <Space>
            <Button
              type="outline"
              icon={<IconDownload />}
              onClick={handleExport}
              disabled={units.length === 0}
            >
              Export to Excel
            </Button>
            <Button type="primary" icon={<IconPlus />} onClick={handleAdd}>
              Add
            </Button>
          </Space>
        </Row>
      </Form>

      {/* Empty State */}
      {!loading && units.length === 0 ? (
        <Empty
          icon={<IconFile style={{ fontSize: 64, color: '#165DFF' }} />}
          description={
            <Space direction="vertical" align="center">
              <div style={{ fontSize: 16, fontWeight: 500 }}>No unit standards found</div>
              <div style={{ color: '#86909C' }}>
                {form.getFieldsValue().name || form.getFieldsValue().USLevel
                  ? 'Try adjusting your search filters'
                  : 'Get started by creating your first unit standard'}
              </div>
              <Button type="primary" icon={<IconPlus />} onClick={handleAdd} style={{ marginTop: 10 }}>
                Create Unit Standard
              </Button>
            </Space>
          }
        />
      ) : (
        <Table
          rowKey={'UnitStandardID'}
          expandedRowRender={handleRowRender}
          expandProps={{
            icon: ({ expanded, record, ...restProps }) =>
              expanded ? (
                <button {...restProps}>
                  <IconDown />
                </button>
              ) : (
                <button {...restProps}>
                  <IconRight />
                </button>
              ),
            expandRowByClick: true,
          }}
          columns={columns}
          data={units}
          loading={loading}
          pagination={getPaginationConfig(pagination, setPagination)}
        />
      )}
      <Modal
        title={rowData?.UnitStandardID ? 'Edit Unit Standard' : 'Add Unit Standard'}
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
      >
        <UnitEditForm
          rowData={rowData}
          onOk={(unitName) => {
            setVisible(false);
            handleSearch();
            Notification.success({
              title: 'Success',
              content: `Unit Standard "${unitName}" has been ${rowData?.UnitStandardID ? 'updated' : 'created'} successfully.`,
              duration: 3000,
            });
          }}
          onCancel={() => { setVisible(false); }}
        />
      </Modal>
    </div>
  );
};

export default UnitManagement;
