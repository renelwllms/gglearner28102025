import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Select,
  Space,
  Notification,
  Card,
  Tabs,
  Typography,
  Tag,
  Input,
  Form,
} from '@arco-design/web-react';
import * as services from '@/services';
import { IconRefresh, IconSave } from '@arco-design/web-react/icon';

const { Title, Text } = Typography;
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;

const CATEGORIES = [
  { label: 'Work & Life Skills', value: 'Work & Life Skills' },
  { label: 'Farming & Horticulture', value: 'Farming & Horticulture' },
  { label: 'Not Assigned', value: null },
];

const RemoteRegistrationCategories = () => {
  const [courses, setCourses] = useState([]);
  const [unitStandards, setUnitStandards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<{ type: 'course' | 'unit', id: number } | null>(null);
  const [notificationEmail, setNotificationEmail] = useState<string>('');
  const [savingEmail, setSavingEmail] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
    fetchNotificationSettings();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coursesRes, unitsRes] = await Promise.all([
        services.course.getCoursesWithCategories(),
        services.course.getUnitStandardsWithCategories(),
      ]);

      setCourses(coursesRes?.data || []);
      setUnitStandards(unitsRes?.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      Notification.error({
        title: 'Error',
        content: 'Failed to load courses and unit standards. Please try again.',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationSettings = async () => {
    try {
      const res = await services.course.getCategoryNotificationSettings();
      if (res?.code === 0) {
        setNotificationEmail(res.data?.NotificationEmail || '');
      } else if (res?.code === 1) {
        // Table doesn't exist
        Notification.error({
          title: 'Database Setup Required',
          content: res.message || 'Please run the database setup script first.',
          duration: 10000,
        });
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
      Notification.error({
        title: 'Error',
        content: 'Failed to load notification settings. Please check the console for details.',
        duration: 5000,
      });
    }
  };

  const handleUpdateNotificationEmail = async () => {
    setSavingEmail(true);
    try {
      const res = await services.course.updateCategoryNotificationEmail({
        NotificationEmail: notificationEmail || null,
      });

      if (res?.code === 0) {
        Notification.success({
          title: 'Success',
          content: 'Notification email updated successfully',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Failed to update notification email:', error);
      Notification.error({
        title: 'Update Failed',
        content: 'Failed to update notification email. Please try again.',
        duration: 5000,
      });
    } finally {
      setSavingEmail(false);
    }
  };

  const handleCourseCategory = async (courseId: number, category: string | null) => {
    setSaving({ type: 'course', id: courseId });
    try {
      const res = await services.course.updateCourseCategory({
        CourseID: courseId,
        CourseCategory: category,
      });

      if (res?.code === 0) {
        Notification.success({
          title: 'Success',
          content: 'Course category updated successfully',
          duration: 3000,
        });

        // Update local state
        setCourses(prev =>
          prev.map(c => c.CourseID === courseId ? { ...c, CourseCategory: category } : c)
        );
      }
    } catch (error) {
      console.error('Failed to update course category:', error);
      Notification.error({
        title: 'Update Failed',
        content: 'Failed to update course category. Please try again.',
        duration: 5000,
      });
    } finally {
      setSaving(null);
    }
  };

  const handleUnitStandardCategory = async (unitStandardId: number, category: string | null) => {
    setSaving({ type: 'unit', id: unitStandardId });
    try {
      const res = await services.course.updateUnitStandardCategory({
        UnitStandardID: unitStandardId,
        USCategory: category,
      });

      if (res?.code === 0) {
        Notification.success({
          title: 'Success',
          content: 'Unit standard category updated successfully',
          duration: 3000,
        });

        // Update local state
        setUnitStandards(prev =>
          prev.map(u => u.UnitStandardID === unitStandardId ? { ...u, USCategory: category } : u)
        );
      }
    } catch (error) {
      console.error('Failed to update unit standard category:', error);
      Notification.error({
        title: 'Update Failed',
        content: 'Failed to update unit standard category. Please try again.',
        duration: 5000,
      });
    } finally {
      setSaving(null);
    }
  };

  const courseColumns = [
    {
      title: 'Course Name',
      dataIndex: 'CourseName',
      width: 300,
    },
    {
      title: 'Level',
      dataIndex: 'CourseLevel',
      width: 80,
      render: (level) => level || '-',
    },
    {
      title: 'Credits',
      dataIndex: 'CourseCredits',
      width: 100,
      render: (credits) => credits || '-',
    },
    {
      title: 'Category',
      dataIndex: 'CourseCategory',
      width: 250,
      render: (category, record) => (
        <Select
          placeholder="Select category"
          value={category || null}
          onChange={(value) => handleCourseCategory(record.CourseID, value)}
          loading={saving?.type === 'course' && saving?.id === record.CourseID}
          disabled={saving?.type === 'course' && saving?.id === record.CourseID}
          allowClear
          style={{ width: '100%' }}
        >
          {CATEGORIES.map(cat => (
            <Select.Option key={cat.value || 'none'} value={cat.value}>
              {cat.label}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Current Status',
      dataIndex: 'CourseCategory',
      width: 180,
      render: (category) => {
        if (!category) {
          return <Tag color="gray">Not Assigned</Tag>;
        }
        return category === 'Work & Life Skills' ? (
          <Tag color="blue">Work & Life Skills</Tag>
        ) : (
          <Tag color="green">Farming & Horticulture</Tag>
        );
      },
    },
  ];

  const unitStandardColumns = [
    {
      title: 'US Number',
      dataIndex: 'US',
      width: 120,
    },
    {
      title: 'Unit Standard Name',
      dataIndex: 'USName',
      width: 350,
    },
    {
      title: 'Level',
      dataIndex: 'USLevel',
      width: 80,
      render: (level) => level || '-',
    },
    {
      title: 'Credits',
      dataIndex: 'USCredits',
      width: 100,
      render: (credits) => credits || '-',
    },
    {
      title: 'Category',
      dataIndex: 'USCategory',
      width: 250,
      render: (category, record) => (
        <Select
          placeholder="Select category"
          value={category || null}
          onChange={(value) => handleUnitStandardCategory(record.UnitStandardID, value)}
          loading={saving?.type === 'unit' && saving?.id === record.UnitStandardID}
          disabled={saving?.type === 'unit' && saving?.id === record.UnitStandardID}
          allowClear
          style={{ width: '100%' }}
        >
          {CATEGORIES.map(cat => (
            <Select.Option key={cat.value || 'none'} value={cat.value}>
              {cat.label}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Current Status',
      dataIndex: 'USCategory',
      width: 180,
      render: (category) => {
        if (!category) {
          return <Tag color="gray">Not Assigned</Tag>;
        }
        return category === 'Work & Life Skills' ? (
          <Tag color="blue">Work & Life Skills</Tag>
        ) : (
          <Tag color="green">Farming & Horticulture</Tag>
        );
      },
    },
  ];

  const workLifeCourses = courses.filter(c => c.CourseCategory === 'Work & Life Skills');
  const farmingCourses = courses.filter(c => c.CourseCategory === 'Farming & Horticulture');
  const unassignedCourses = courses.filter(c => !c.CourseCategory);

  const workLifeUnits = unitStandards.filter(u => u.USCategory === 'Work & Life Skills');
  const farmingUnits = unitStandards.filter(u => u.USCategory === 'Farming & Horticulture');
  const unassignedUnits = unitStandards.filter(u => !u.USCategory);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button
            type="primary"
            icon={<IconRefresh />}
            onClick={fetchData}
            loading={loading}
          >
            Refresh
          </Button>
        </Space>
        <div style={{ marginTop: 12 }}>
          <Text type="secondary">
            Assign courses and unit standards to categories for the Remote Learner Registration form.
            Items assigned to "Work & Life Skills" will appear when users select that pathway, and
            items assigned to "Farming & Horticulture" will appear for that pathway.
          </Text>
        </div>
      </div>

      <Card
        title="Notification Settings"
        style={{ marginBottom: 20 }}
        bordered
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Configure the notification email address for remote learner registrations. When a student registers through the remote registration page,
          a notification with all selected courses from both pathways will be sent to this email address.
        </Text>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card style={{ backgroundColor: '#f7f8fa' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Text strong style={{ minWidth: 180 }}>
                Notification Email:
              </Text>
              <Input
                placeholder="Enter notification email address"
                value={notificationEmail}
                onChange={(value) => setNotificationEmail(value)}
                style={{ flex: 1 }}
              />
              <Button
                type="primary"
                icon={<IconSave />}
                loading={savingEmail}
                onClick={handleUpdateNotificationEmail}
              >
                Save
              </Button>
            </div>
          </Card>
        </div>
      </Card>

      <Tabs defaultActiveTab="1">
        <TabPane key="1" title={`Courses (${courses.length})`}>
          <Card style={{ marginBottom: 16 }}>
            <Space size="large">
              <div>
                <Tag color="blue">Work & Life Skills: {workLifeCourses.length}</Tag>
              </div>
              <div>
                <Tag color="green">Farming & Horticulture: {farmingCourses.length}</Tag>
              </div>
              <div>
                <Tag color="gray">Not Assigned: {unassignedCourses.length}</Tag>
              </div>
            </Space>
          </Card>

          <Table
            columns={courseColumns}
            data={courses}
            loading={loading}
            pagination={{
              pageSize: 20,
              showTotal: true,
              showJumper: true,
            }}
            rowKey="CourseID"
            stripe
            border
          />
        </TabPane>

        <TabPane key="2" title={`Unit Standards (${unitStandards.length})`}>
          <Card style={{ marginBottom: 16 }}>
            <Space size="large">
              <div>
                <Tag color="blue">Work & Life Skills: {workLifeUnits.length}</Tag>
              </div>
              <div>
                <Tag color="green">Farming & Horticulture: {farmingUnits.length}</Tag>
              </div>
              <div>
                <Tag color="gray">Not Assigned: {unassignedUnits.length}</Tag>
              </div>
            </Space>
          </Card>

          <Table
            columns={unitStandardColumns}
            data={unitStandards}
            loading={loading}
            pagination={{
              pageSize: 20,
              showTotal: true,
              showJumper: true,
            }}
            rowKey="UnitStandardID"
            stripe
            border
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default RemoteRegistrationCategories;
