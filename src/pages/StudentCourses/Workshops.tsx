import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Card,
  Form,
  Select,
  Popconfirm,
  Message,
  Space,
} from '@arco-design/web-react';
import {
  IconPlus,
  IconSearch,
} from '@arco-design/web-react/icon';
import Row from '@arco-design/web-react/es/Grid/row';
import * as services from '@/services';
import { useSelector } from 'react-redux';
import useForm from '@arco-design/web-react/es/Form/useForm';
import ResizableTable from '@/components/ResizableTable';
import axios from 'axios';

function Workshops({ student }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const token = useSelector((state: any) => state.token);
  const isAdmin = useSelector((state: any) => state.isAdmin);
  const [pagination, setPagination] = useState({
    total: 0,
    pageSize: 10,
    current: 1,
  });
  const [form] = useForm();
  const [addVisible, setAddVisible] = useState(false);
  const [workshopOptions, setWorkshopOptions] = useState([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);

  const columns = [
    {
      title: 'Workshop Code',
      key: 'Code',
      dataIndex: 'Code',
      width: 120,
    },
    {
      title: 'Course Name',
      key: 'CourseName',
      dataIndex: 'CourseName',
      width: 200,
    },
    {
      title: 'School Name',
      key: 'SchoolName',
      dataIndex: 'SchoolName',
      width: 200,
    },
    {
      title: 'Status',
      dataIndex: 'Status',
      key: 'Status',
      width: 100,
    },
    {
      title: 'Operation',
      dataIndex: 'operation',
      key: 'operation',
      width: 100,
      render: (_e, item) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Popconfirm
            focusLock
            title="Confirm"
            content="Are you sure you want to remove this workshop enrollment?"
            onOk={() => {
              handleDelete(item.StudentInCourseID);
            }}
          >
            <Button type="primary" status="danger" size="mini">
              Remove
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (token && student?.StudentID) {
      getList();
      loadWorkshops();
    }
  }, [token, student?.StudentID]);

  const loadWorkshops = async () => {
    try {
      const res = await axios.get('/api/student/getAllWorkshops');
      console.log('getAllWorkshops response:', res?.data);
      setWorkshopOptions(res?.data?.data || res?.data || []);
    } catch (error) {
      console.error('Error loading workshops:', error);
      Message.error('Failed to load workshops');
    }
  };

  const handleDelete = async (studentInCourseID) => {
    try {
      const res = await axios.post('/api/student/removeWorkshopEnrollment', {
        StudentInCourseID: studentInCourseID,
      });

      if (res?.data?.success) {
        Message.success('Workshop enrollment removed successfully');
        getList();
      } else {
        Message.error('Failed to remove workshop enrollment');
      }
    } catch (error) {
      console.error('Error removing workshop:', error);
      Message.error('Failed to remove workshop enrollment');
    }
  };

  const getList = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/student/getStudentWorkshops', {
        params: {
          StudentID: student?.StudentID,
        },
      });

      console.log('getStudentWorkshops full response:', res);
      console.log('getStudentWorkshops res.data:', res?.data);
      console.log('getStudentWorkshops res.data.data:', res?.data?.data);

      // Handle the response structure from the backend: { code: 0, data: [...] }
      let workshopData = [];
      if (res?.data?.data && Array.isArray(res.data.data)) {
        workshopData = res.data.data;
      } else if (Array.isArray(res?.data)) {
        workshopData = res.data;
      }

      console.log('Workshop data to set:', workshopData);
      console.log('Is array?', Array.isArray(workshopData));

      setData(workshopData);
      setPagination({ ...pagination, total: workshopData.length || 0 });
    } catch (error) {
      console.error('Error loading student workshops:', error);
      Message.error('Failed to load workshops');
    } finally {
      setLoading(false);
    }
  };

  const onChangeTable = (pagination) => {
    const { current, pageSize } = pagination;
    setPagination({ ...pagination, current, pageSize });
  };

  const handleAdd = () => {
    setSelectedWorkshop(null);
    form.resetFields();
    setAddVisible(true);
  };

  const handleAddSubmit = async () => {
    try {
      const values = await form.validate();

      if (!values.WorkshopCode) {
        Message.warning('Please select a workshop');
        return;
      }

      setLoading(true);
      const res = await axios.post('/api/student/addWorkshopEnrollment', {
        StudentID: student?.StudentID,
        WorkshopCode: values.WorkshopCode,
      });

      if (res?.data?.success) {
        Message.success('Workshop enrollment added successfully');
        setAddVisible(false);
        form.resetFields();
        getList();
      } else {
        Message.error(res?.data?.message || 'Failed to add workshop enrollment');
      }
    } catch (error) {
      console.error('Error adding workshop:', error);
      Message.error('Failed to add workshop enrollment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" icon={<IconPlus />} onClick={handleAdd}>
            Add Workshop
          </Button>
        </div>

        <ResizableTable
          columns={columns}
          rowKey={'StudentInCourseID'}
          data={data}
          loading={loading}
          scroll={{
            x: 800,
          }}
          border={{
            wrapper: true,
            cell: true,
          }}
          pagination={{
            ...pagination,
            size: 'mini',
            bufferSize: 3,
            sizeCanChange: true,
            showTotal: true,
            showJumper: true,
            pageSizeChangeResetCurrent: true,
          }}
          onChange={onChangeTable}
        />
      </Card>

      <Modal
        title="Add Workshop Enrollment"
        visible={addVisible}
        onOk={handleAddSubmit}
        onCancel={() => {
          setAddVisible(false);
          form.resetFields();
        }}
        confirmLoading={loading}
        autoFocus={false}
        focusLock={true}
      >
        <Form
          form={form}
          labelAlign="left"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        >
          <Form.Item
            label="Workshop"
            field="WorkshopCode"
            rules={[{ required: true, message: 'Please select a workshop' }]}
          >
            <Select
              placeholder="Select a workshop"
              showSearch
              allowClear
              filterOption={(inputValue, option) => {
                const label = option.props.children?.toString().toLowerCase() || '';
                return label.indexOf(inputValue.toLowerCase()) >= 0;
              }}
            >
              {workshopOptions.map((workshop) => (
                <Select.Option key={workshop.Code} value={workshop.Code}>
                  {workshop.Code} - {workshop.CourseName} ({workshop.SchoolName})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default Workshops;
