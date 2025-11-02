import React, { useEffect, useState } from 'react';
import moment from 'moment';
import {
  Card,
  Button,
  TableColumnProps,
  Popconfirm,
  Message,
  Modal,
  Space,
  Tabs,
  Badge,
  Typography,
  Empty,
  Notification,
  Select
} from '@arco-design/web-react';
import * as services from '@/services';
import SearchForm from './form';
import { useSelector } from 'react-redux';
import Result from './Result';
import UpdateForm from '../workshop-tag/update';
import useForm from '@arco-design/web-react/es/Form/useForm';
import ResizableTable from '@/components/ResizableTable';
const TabPane = Tabs.TabPane;
const { Text } = Typography;
const { Option } = Select;

function MyWorkshop() {
  const token = useSelector((state: any) => state.token);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [rowData, setRowData] = useState({ WorkshopID: 0 });
  const [visibleWorkshopEdit, setVisibleWorkshopEdit] = useState(false);
  const [form] = useForm();
  const [resultVisible, setResultVisible] = useState(false);
  const [code, setCode] = useState('');
  const [courseOption, setCourse] = useState([]);
  const [schoolOption, setSchoolOption] = useState([]);
  const [activeKey, setActiveKey] = useState('1');
  const [formParams, setFormParams] = useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: true,
    showJumper: true,
    sizeCanChange: true,
    pageSizeChangeResetCurrent: true,
  });
  const isAdmin = useSelector((state: any) => state.isAdmin);
  const userInfo = useSelector((state: any) => state.userInfo);

  const getPaymentStatusBadge = (status: string) => {
    const statusMap = {
      'Paid': { status: 'success', text: 'Paid' },
      'Unpaid': { status: 'error', text: 'Unpaid' },
      'Partially Paid': { status: 'warning', text: 'Partially Paid' },
    };
    const config = statusMap[status] || { status: 'default', text: status };
    return <Badge status={config.status as any} text={config.text} />;
  };

  const getWorkshopStatusBadge = (status: string) => {
    const statusMap = {
      'Processed': { status: 'success', text: 'Processed' },
      'Unprocessed': { status: 'warning', text: 'Unprocessed' },
    };
    const config = statusMap[status] || { status: 'default', text: status };
    return <Badge status={config.status as any} text={config.text} />;
  };

  const columns: TableColumnProps[] = [
    {
      title: 'Workshop Name',
      dataIndex: 'CourseName',
      key: "CourseName",
      width: 180,
      fixed: 'left',
    },
    {
      title: 'Code',
      dataIndex: 'Code',
      key: "Code",
      width: 230,
    },
    {
      title: 'Course Date',
      dataIndex: 'CourseDate',
      key: "CourseDate",
      width: 120,
      render: (e) => moment(e).format('DD/MM/YYYY'),
    },
    {
      title: 'School Name',
      dataIndex: 'SchoolName',
      key: "SchoolName",
    },
    {
      title: 'Location',
      dataIndex: 'Location',
      key: "Location",
      ellipsis: true,
    },
    {
      title: 'Number of learners attending',
      dataIndex: 'StudentsNum',
      key: "StudentsNum",
      ellipsis: true,
      width: 100,
    },
    {
      title: 'Teacher',
      dataIndex: 'Tutor',
      key: "Tutor",
      ellipsis: !isAdmin,
      hideInTable: false,
    },
    {
      title: 'Payment Status',
      dataIndex: 'PaymentStatus',
      key: "PaymentStatus",
      width: 140,
      render: (status, item) => (
        <Select
          value={status || 'Unpaid'}
          size="small"
          style={{ width: '120px' }}
          onChange={(value) => handlePaymentStatusChange(item.WorkshopID, value)}
          onClick={(e) => e.stopPropagation()}
        >
          <Option value="Paid">
            <Badge status="success" text="Paid" />
          </Option>
          <Option value="Partially Paid">
            <Badge status="warning" text="Partially Paid" />
          </Option>
          <Option value="Unpaid">
            <Badge status="error" text="Unpaid" />
          </Option>
        </Select>
      ),
    },
    {
      title: 'Workshop Status',
      dataIndex: 'WorkshopStatus',
      key: "WorkshopStatus",
      width: 150,
      render: (status, item) => (
        <Select
          value={status || 'Unprocessed'}
          size="small"
          style={{ width: '130px' }}
          onChange={(value) => handleWorkshopStatusChange(item.Code, value)}
          onClick={(e) => e.stopPropagation()}
        >
          <Option value="Unprocessed">
            <Badge status="warning" text="Unprocessed" />
          </Option>
          <Option value="Processed">
            <Badge status="success" text="Processed" />
          </Option>
        </Select>
      ),
    },

    {
      title: 'Operation',
      dataIndex: 'Operation',
      render: (_e, item) => (
        <Space>

          <Button
            type="primary"
            size="mini"
            onClick={() => {
              setCode(item.Code);
              setRowData(item);
              setResultVisible(true);
            }}
          >
            details
          </Button>
          <Button
            type="primary"
            size="mini"
            onClick={() => {
              setRowData(item);
              form.setFieldsValue({
                ...item,
                CourseName: { label: item.CourseName, value: item.CourseID },
                SchoolName: { label: item.SchoolName, value: item.SchoolNumber },
              });
              setVisibleWorkshopEdit(true);
            }}
          >
            Edit
          </Button>

          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Popconfirm
              focusLock
              title="Confirm"
              content="Are you sure you want to delete?"
              onOk={() => {
                handleDelete(item.WorkshopID);
              }}
            >
              <Button type="primary" status="danger" size="mini">
                Delete
              </Button>
            </Popconfirm>
          </div>
        </Space>
      ),
      fixed: 'right',
      width: 150,
    },
  ];

  const tabList = [
    { key: '1', title: 'All' },
    { key: '2', title: 'Processed' },
    { key: '3', title: 'Unprocessed' },];

  const getList = async (data = {}) => {
    setLoading(true);
    try {
      const res = await services.g.getWorkshop({
        ...formParams,
        ...data,
        Email: (isAdmin ? '' : userInfo.mail),
      });
      const workshops = res?.data || [];
      setData(workshops);
      setPagination(prev => ({
        ...prev,
        total: workshops.length,
      }));
    } catch (error) {
      console.error('Failed to load workshops:', error);
      Message.error('Failed to load workshops. Please try again.');
      setData([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  };


  const getOptions = (data = {}) => {
    services.g.getCourse({}).then((res) => {
      setCourse(res?.data || []);
    });
    services.g.getSchool({}).then((res) => {
      setSchoolOption(res?.data || []);
    });
  };


  const handleDelete = async (id) => {
    try {
      const res = await services.g.deleteWorkshop({ WorkshopID: id });
      if (res?.data) {
        Notification.success({
          title: 'Success',
          content: 'Workshop has been deleted successfully',
          duration: 3000,
        });
        getList();
      }
    } catch (error) {
      console.error('Failed to delete workshop:', error);
      Notification.error({
        title: 'Error',
        content: 'Failed to delete workshop. Please try again.',
        duration: 5000,
      });
    }
  };

  const handlePaymentStatusChange = async (WorkshopID, PaymentStatus) => {
    try {
      const res = await services.g.WorkshopPaymentStatusChange({ WorkshopID, PaymentStatus });
      if (res?.code === 0) {
        Message.success('Payment status updated successfully');
        // Refresh the list while maintaining current tab filter
        const selectedTab = tabList.find((tab) => tab.key === activeKey);
        getList(activeKey !== '1' ? { Status: selectedTab.title } : {});
      } else {
        Message.error(res?.message || 'Failed to update payment status');
      }
    } catch (error) {
      console.error('Failed to update payment status:', error);
      Message.error('Failed to update payment status. Please try again.');
    }
  };

  const handleWorkshopStatusChange = async (code, Status) => {
    try {
      const res = await services.g.WorkshopStatusChange({ code, Status });
      if (res?.code === 0) {
        Message.success('Workshop status updated successfully');
        // Refresh the list while maintaining current tab filter
        const selectedTab = tabList.find((tab) => tab.key === activeKey);
        getList(activeKey !== '1' ? { Status: selectedTab.title } : {});
      } else {
        Message.error(res?.message || 'Failed to update workshop status');
      }
    } catch (error) {
      console.error('Failed to update workshop status:', error);
      Message.error('Failed to update workshop status. Please try again.');
    }
  };

  useEffect(() => {
    if (token) {
      getOptions();
      getList();
    }
  }, [token]);
  const handleRowDoubleClick = (item) => {
    setRowData(item);
    form.setFieldsValue({
      ...item,
      CourseName: { label: item.CourseName, value: item.CourseID },
      SchoolName: { label: item.SchoolName, value: item.SchoolNumber },
    });
    setVisibleWorkshopEdit(true);
  };

  function handleSearch(params) {
    getList({
      CourseID: params?.CourseID?.value,
      Code: params.Code,
      Status: params?.Status,
      SchoolNumber: params?.schoolOptionVal
    });
  }

  const getAddressFromSchool = (school) => {
    return `${school['Street']} ${school['Suburb'] ? ', ' + school['Suburb'] : ''} ${school['City'] ? ', ' + school['City'] : ''} ,  ${school['DHB']}`;
  }
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const filterOpt = schoolOption.filter((opt) => opt.SchoolNumber == values?.SchoolName?.value);
      if (!filterOpt.length) {
        Notification.warning({
          title: 'Validation Error',
          content: 'Selected school not found. Please select a valid school.',
          duration: 4000,
        });
        return;
      }
      const Location = getAddressFromSchool(filterOpt[0]);
      const res = await services.g.postWorkshop({
        WorkshopID: rowData.WorkshopID,
        ...values,
        CourseID: values?.CourseName?.value,
        CourseName: values?.CourseName?.label,
        SchoolNumber: values?.SchoolName?.value,
        SchoolName: values?.SchoolName?.label,
        Location,
      });
      if (res?.data) {
        Notification.success({
          title: 'Success',
          content: 'Workshop has been updated successfully',
          duration: 3000,
        });
        setVisibleWorkshopEdit(false);
        form.resetFields();
        // Refresh the list while maintaining current tab filter
        const selectedTab = tabList.find((tab) => tab.key === activeKey);
        getList(activeKey !== '1' ? { Status: selectedTab.title } : {});
      }
    } catch (error) {
      console.error('Failed to update workshop:', error);
      Notification.error({
        title: 'Error',
        content: 'Failed to update workshop. Please try again.',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeTab = (key) => {
    setActiveKey(key);
    setPagination(prev => ({ ...prev, current: 1 }));
    const selectedTab = tabList.find((tab) => tab.key === key);
    getList(key !== '1' ? { Status: selectedTab.title } : {});
  };

  const handlePaginationChange = (current, pageSize) => {
    setPagination(prev => ({
      ...prev,
      current,
      pageSize,
    }));
  };


  return (
    <div style={{ padding: 0, margin: 0 }}>
      <Card style={{ marginBottom: '16px' }}>
        <SearchForm onSearch={handleSearch} />
      </Card>
      <Card>
        <Tabs defaultActiveTab="1" destroyOnHide onChange={handleChangeTab}>
          <TabPane key="1" title="All">
            <ResizableTable
              columns={columns}
              data={data.map((item) => ({ ...item, key: item.WorkshopID || item.Code }))}
              loading={loading}
              scroll={{
                x: 1300,
              }}
              border={{
                wrapper: true,
                cell: true,
              }}
              pagination={{
                ...pagination,
                onChange: handlePaginationChange,
                showTotal: (total) => `Total ${total} workshops`,
              }}
              noDataElement={
                <Empty
                  description="No workshops found. Try adjusting your search filters."
                />
              }
              onRow={(item, index) => ({
                onDoubleClick: () => handleRowDoubleClick(item),
                style: { cursor: 'pointer' }
              })}
            />
            {data.length > 0 && (
              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  💡 Tip: Double-click any row to edit workshop details
                </Text>
              </div>
            )}
          </TabPane>
          <TabPane key="2" title="Processed">
            <ResizableTable
              columns={columns}
              data={data.map((item) => ({ ...item, key: item.WorkshopID || item.Code }))}
              loading={loading}
              scroll={{
                x: 1300,
              }}
              border={{
                wrapper: true,
                cell: true,
              }}
              pagination={{
                ...pagination,
                onChange: handlePaginationChange,
                showTotal: (total) => `Total ${total} processed workshops`,
              }}
              noDataElement={
                <Empty
                  description="No processed workshops found. Try adjusting your search filters."
                />
              }
              onRow={(item, index) => ({
                onDoubleClick: () => handleRowDoubleClick(item),
                style: { cursor: 'pointer' }
              })}
            />
            {data.length > 0 && (
              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  💡 Tip: Double-click any row to edit workshop details
                </Text>
              </div>
            )}
          </TabPane>
          <TabPane key="3" title="Unprocessed">
            <ResizableTable
              columns={columns}
              data={data.map((item) => ({ ...item, key: item.WorkshopID || item.Code }))}
              loading={loading}
              scroll={{
                x: 1300,
              }}
              border={{
                wrapper: true,
                cell: true,
              }}
              pagination={{
                ...pagination,
                onChange: handlePaginationChange,
                showTotal: (total) => `Total ${total} unprocessed workshops`,
              }}
              noDataElement={
                <Empty
                  description="No unprocessed workshops found. Try adjusting your search filters."
                />
              }
              onRow={(item, index) => ({
                onDoubleClick: () => handleRowDoubleClick(item),
                style: { cursor: 'pointer' }
              })}
            />
            {data.length > 0 && (
              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  💡 Tip: Double-click any row to edit workshop details
                </Text>
              </div>
            )}
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title="Learners"
        visible={resultVisible}
        footer={
          <div style={{ textAlign: 'center' }}>
            <Button type="primary" onClick={() => setResultVisible(false)}>
              {'ok'}
            </Button>
          </div>
        }
        onCancel={() => setResultVisible(false)}
        autoFocus={false}
        focusLock={true}
        unmountOnExit={true}
        style={{ width: '100%' }}
      >
        <Result
          Code={code}
          status={rowData["WorkshopStatus"]}
          getWorkshopList={getList}
          workShopData={rowData}
        ></Result>
      </Modal>

      <Modal
        title="Edit My Workshop"
        visible={visibleWorkshopEdit}
        footer={null}
        onCancel={() => {
          setVisibleWorkshopEdit(false);
          form.resetFields();
        }}
        autoFocus={false}
        focusLock={true}
        unmountOnExit={true}
        style={{ width: '600px' }}
      >
        <UpdateForm
          form={form}
          handleCancel={() => {
            setVisibleWorkshopEdit(false);
            form.resetFields();
          }}
          handleSubmit={handleSubmit}
          loading={loading}
          rowData={rowData}
        ></UpdateForm>
      </Modal>
    </div>
  );
}

export default MyWorkshop;
