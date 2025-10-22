import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Table,
  Button,
  Message,
  Modal,
  Form,
  Input,
  Space,
  InputNumber,
  Descriptions,
  Popconfirm,
  Notification,
  Statistic,
  Grid,
  Card,
  Empty,
  Tag,
} from '@arco-design/web-react';
import * as services from '@/services';
import CourseEditForm from './CourseEditForm';
import useForm from '@arco-design/web-react/es/Form/useForm';
import Row from '@arco-design/web-react/es/Grid/row';
import {
  IconDown,
  IconPlus,
  IconRefresh,
  IconRight,
  IconSearch,
  IconBook,
  IconCopy,
  IconDownload,
} from '@arco-design/web-react/icon';
import debounce from 'lodash/debounce';
import { exportCoursesToExcel } from './exportUtils';

const { Col } = Grid;

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [rowData, setRow] = useState<any>({});
  const [visible, setVisible] = useState(false);
  const [unitStandards, setUnitStandards] = useState([]);
  const [form] = useForm();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  // Fetch all courses
  useEffect(() => {
    fetchCourses();
    fetchUnits();
  }, []);

  const fetchCourses = (data = {}) => {
    setLoading(true);
    services.course
      .getCourses(data)
      .then((res) => {
        setCourses(res?.data || []);
        setPagination(prev => ({ ...prev, total: res?.data?.length || 0 }));
      })
      .catch((error) => {
        console.error('Failed to load courses:', error);
        Notification.error({
          title: 'Error',
          content: 'Failed to load courses. Please try again.',
          duration: 5000,
        });
      })
      .finally(() => {
        setLoading(false);
      });
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

  const handleAdd = () => {
    setRow({});
    setVisible(true);
  };

  // Open course edit form
  const handleEdit = (course) => {
    setRow(course);
    setVisible(true);
  };

  const columns = [
    {
      title: 'Course Name',
      dataIndex: 'CourseName',
      key: 'CourseName',
    },
    {
      title: 'Course Details',
      dataIndex: 'CourseDetails',
      key: 'CourseDetails',
    },
    {
      title: 'Course Level',
      dataIndex: 'CourseLevel',
      key: 'CourseLevel',
    },
    {
      title: 'Course Credits',
      dataIndex: 'CourseCredits',
      key: 'CourseCredits',
    },
    {
      title: 'Usage',
      dataIndex: 'Usage',
      key: 'Usage',
      render: (_, record) => (
        <Space>
          {record.StudentCount > 0 && (
            <Tag color="blue">{record.StudentCount} Student{record.StudentCount !== 1 ? 's' : ''}</Tag>
          )}
          {record.InMicrocredentialCount > 0 && (
            <Tag color="gold">In {record.InMicrocredentialCount} Microcredential{record.InMicrocredentialCount !== 1 ? 's' : ''}</Tag>
          )}
          {record.StudentCount === 0 && record.InMicrocredentialCount === 0 && (
            <Tag color="gray">Not in use</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Operation',
      dataIndex: 'Operation',
      render: (_, record) => (
        <Space>
          <Button
            size="mini"
            type="primary"
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
            content={`Are you sure you want to delete "${record.CourseName}"?`}
            onOk={() => handleDelete(record.CourseID, record.CourseName)}
          >
            <Button
              type="primary"
              status="danger"
              size="mini"
              loading={deleteLoading === record.CourseID}
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
      const res = await services.course.deleteCourse({ id });
      if (res?.data) {
        Notification.success({
          title: 'Success',
          content: `Course "${name}" has been deleted successfully.`,
          duration: 3000,
        });
        fetchCourses();
      }
    } catch (error) {
      console.error('Failed to delete course:', error);
      Notification.error({
        title: 'Deletion Failed',
        content: 'Failed to delete course. Please try again.',
        duration: 5000,
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSearch = () => {
    const values = form.getFieldsValue();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchCourses(values);
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
    fetchCourses();
  };

  const handleRowRender = (row) => {
    if (!row.UnitStandardIDs) return 'No Unit Standard available at the moment';
    if (!unitStandards || !unitStandards?.length) return 'Loading';
    const infoData = row.UnitStandardIDs?.map((item) => {
      const us: any = unitStandards?.find((e) => e.UnitStandardID === item);
      return {
        label: `${us?.US} - `,
        value: us?.USName,
      };
    });
    return (
      <Descriptions
        layout="inline-horizontal"
        column={1}
        border
        data={infoData}
      />
    );
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }

  // Duplicate/Clone course
  const handleDuplicate = (course) => {
    const duplicatedCourse = {
      ...course,
      CourseName: `${course.CourseName} (Copy)`,
      CourseID: undefined, // Remove ID so it creates new
    };
    setRow(duplicatedCourse);
    setVisible(true);
  };

  // Export to Excel
  const handleExport = async () => {
    try {
      await exportCoursesToExcel(courses, unitStandards);
      Notification.success({
        title: 'Export Successful',
        content: `${courses.length} courses exported to Excel`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Export error:', error);
      Notification.error({
        title: 'Export Failed',
        content: 'Failed to export courses. Please try again.',
        duration: 3000,
      });
    }
  };

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalCourses = courses.length;
    const level1Count = courses.filter(c => c.CourseLevel === 1).length;
    const level2Count = courses.filter(c => c.CourseLevel === 2).length;
    const level3Count = courses.filter(c => c.CourseLevel === 3).length;
    const totalCredits = courses.reduce((sum, c) => sum + (parseInt(c.CourseCredits) || 0), 0);
    const avgCredits = totalCourses > 0 ? Math.round(totalCredits / totalCourses) : 0;

    return {
      totalCourses,
      level1Count,
      level2Count,
      level3Count,
      totalCredits,
      avgCredits,
    };
  }, [courses]);

  return (
    <div>
      {/* Statistics Dashboard */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Courses"
              value={statistics.totalCourses}
              prefix={<IconBook />}
              styleValue={{ color: '#0FC6C2' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Level 1-2 Courses"
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
              suffix="per course"
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
          display: 'inline-block',
          marginBottom: '10px',
        }}
      >
        <Row justify="space-between" align="center">
          <Space wrap>
            <Form.Item label="Course Name" field="CourseName">
              <Input
                allowClear
                onKeyDown={handleKeyDown}
                onChange={debouncedSearch}
                placeholder="Please enter"
              />
            </Form.Item>
            <Form.Item label="Course Level" field="CourseLevel">
              <InputNumber
                onKeyDown={handleKeyDown}
                onChange={debouncedSearch}
                placeholder="Please enter"
              />
            </Form.Item>
            <Form.Item label="Course Credits" field="CourseCredits">
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
              disabled={courses.length === 0}
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
      {!loading && courses.length === 0 ? (
        <Empty
          icon={<IconBook style={{ fontSize: 64, color: '#165DFF' }} />}
          description={
            <Space direction="vertical" align="center">
              <div style={{ fontSize: 16, fontWeight: 500 }}>No courses found</div>
              <div style={{ color: '#86909C' }}>
                {form.getFieldsValue().CourseName || form.getFieldsValue().CourseLevel
                  ? 'Try adjusting your search filters'
                  : 'Get started by creating your first course'}
              </div>
              <Button type="primary" icon={<IconPlus />} onClick={handleAdd} style={{ marginTop: 10 }}>
                Create Course
              </Button>
            </Space>
          }
        />
      ) : (
        <Table
          rowKey={'CourseID'}
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
          data={courses}
          loading={loading}
          pagination={{
            ...pagination,
            showTotal: true,
            showJumper: true,
            sizeCanChange: true,
            onChange: (current, pageSize) => {
              setPagination({ ...pagination, current, pageSize });
            },
          }}
        />
      )}
      <Modal
        title={rowData?.CourseID ? 'Edit Course' : 'Add Course'}
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={null}
      >
        <CourseEditForm
          rowData={rowData}
          unitStandards={unitStandards}
          onOk={(courseName) => {
            setVisible(false);
            handleSearch();
            Notification.success({
              title: 'Success',
              content: `Course "${courseName}" has been ${rowData?.CourseID ? 'updated' : 'created'} successfully.`,
              duration: 3000,
            });
          }}
          onCancel={() => { setVisible(false); }}
        />
      </Modal>
    </div>
  );
};

export default CourseList;
