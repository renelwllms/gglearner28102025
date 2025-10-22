import React, { useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import {
  Table,
  Button,
  Modal,
  Card,
  Form,
  InputNumber,
  Popconfirm,
  Message,
  Input,
  Space,
  Descriptions,
  Checkbox,
} from '@arco-design/web-react';
import {
  IconDown,
  IconPlus,
  IconRefresh,
  IconRight,
  IconSearch,
} from '@arco-design/web-react/icon';
import Row from '@arco-design/web-react/es/Grid/row';
import * as services from '@/services';
import { useDispatch, useSelector } from 'react-redux';
import Courses from './Courses';
import useForm from '@arco-design/web-react/es/Form/useForm';
import Assess from './Assess';
import AddCourse from './AddCourse';
import ResizableTable from '@/components/ResizableTable';
import Certificate from '../certificate';

function LearnerSearch({ onCancel = null, student }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const token = useSelector((state: any) => state.token);
  const isAdmin = useSelector((state: any) => state.isAdmin);
  const [formParams, setFormParams] = useState({});
  const [pagination, setPagination] = useState({
    total: 0,
    pageSize: 10,
    current: 1,
  });
  const [rowData, setRow] = useState<any>({});
  const [form] = useForm();
  const [addVisible, setAddVisible] = useState(false);
  const [columns, setColumns] = useState([]);
  const [columnsKey, setColumnsKey] = useState(1);
  const userInfo = useSelector((state: any) => state.userInfo);
  const [assessVisible, setAssessVisible] = useState(false);
  const [certificateVisible, setCertificateVisible] = useState(false);
  const [isAll, setAll] = useState(false);

  useEffect(() => {
    const Operation = [
      {
        title: 'Operation',
        dataIndex: 'operation',
        key: 'operation',
        width: 115,
        render: (_e, item) => (
          <Space>
            <Button
              type="primary"
              size="mini"
              onClick={(e) => {
                e.stopPropagation();
                setRow(item);
                console.log("item", item);
                console.log("rowData", rowData);
                setAssessVisible(true);
              }}
            >
              Assess
            </Button>

            <Button
              type="primary"
              size="mini"
              onClick={(e) => {
                e.stopPropagation();
                console.log(item);
                if (!item.CourseStatus) return Message.warning('Not yet assessed');
                if (!item.CourseStatus || item.CourseStatus === 'Not Yet Achieved') {
                  return Message.warning('Not yet assessed');
                }
                setAll(false);
                setRow(item);
                setCertificateVisible(true);
              }}
            >
              Certificate
            </Button>


            <Button
              type="primary"
              size="mini"
              onClick={(e) => {
                e.stopPropagation();
                setRow(item);
                console.log(item);
                setAddVisible(true);
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
                  handleDelete(item.Id);
                }}
              >
                <Button type="primary" status="danger" size="mini">
                  Delete
                </Button>
              </Popconfirm>
            </div>
          </Space>
        ),
      },
    ];

    setColumns([
      {
        title: 'Course Name',
        key: 'CourseName',
        dataIndex: 'CourseName',
        width: 160,
      },
      {
        title: 'Status',
        dataIndex: 'CourseStatus',
        key: 'CourseStatus',
        width: 85,
      },
      ...Operation,
    ]);
    setColumnsKey(columnsKey + 1);
  }, [isAdmin]);

  useEffect(() => {
    if (token) {
      getList();
    }
  }, [token]);


  const handleDelete = (id) => {
    services.student
      .deleteCourse({
        id,
      })
      .then((res) => {
        if (res?.data) {
          Message.success('success');
          getList();
        }
      });
  };

  const getList = (data = {}) => {
    setLoading(true);
    services.student
      .getAllCourses({
        ...pagination,
        ...formParams,
        ...data,
        id: student?.StudentID,
        total: undefined,
        Email: (isAdmin ? '' : userInfo.mail)
      })
      .then((res) => {
        setData(res?.data || []);
        setPagination({ ...pagination, ...res?.pagination });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onChangeTable = (pagination) => {
    const { current, pageSize } = pagination;
    setPagination({ ...pagination, current, pageSize });
    getList({ current, pageSize });
  };


  const handleAssessCancel = () => {
    setAssessVisible(false);
    setLoading(false);
  }

  const handleAdd = () => {
    setRow({});
    setAddVisible(true);
  };


  const handleVisible = (value) => {
    setAddVisible(value);
  };

  return (
    <>
      <Card>

        <Form
          form={form}
          labelAlign="left"
          layout="inline"
          style={{
            display: 'inline-block',
            marginBottom: '10px',
          }}
        >
          <Row>
            <Form.Item label={'Name'} field="DeliverySpecialist">
              <Input allowClear placeholder={'Please enter'} />
            </Form.Item>
            <Space>
              <Button type="primary" icon={<IconSearch />}>
                {'Search'}
              </Button>
              <Button>
                {'Cancel'}
              </Button>
            </Space>
            <div
              style={{
                position: 'absolute',
                right: '20px',
                display: 'inline-block',
              }}
            >
              <Button type="primary" icon={<IconPlus />} onClick={handleAdd}>
                Add
              </Button>
            </div>
          </Row>
        </Form>

        <ResizableTable
          key={columnsKey}
          columns={columns}
          rowKey={'Id'}
          data={data}
          loading={loading}
          scroll={{
            x: 1000,
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

        <Row>
          <Space>
          </Space>
          <div
            style={{
              position: 'absolute',
              right: '20px',
              display: 'inline-block',
            }}
          >
            {onCancel && (
            <Button onClick={onCancel}
            >
              {'Close'}
            </Button>)}
          </div>
        </Row>

      </Card>
      {/* 
      <Modal
        title="Assess Courses"
        visible={assessVisible}
        footer={null}
        onCancel={handleAssessCancel}
        autoFocus={false}
        focusLock={true}
        unmountOnExit={true}
        style={{ width: '500px' }}
      >
      </Modal>
       */}
      <Assess
        id={rowData?.Id || 0}
        assessVisible={assessVisible}
        setAssessVisible={handleAssessCancel}
        studentData={student}
        assesCourseData={rowData}
        list={getList}
      />
      <AddCourse
        id={rowData?.Id || 0}
        visibility={addVisible}
        setVisible={handleVisible}
        studentData={student}
        list={getList}
        courseData={rowData}
      />


      <Certificate
        certificateVisible={certificateVisible}
        certificateVisibleHandle={() => {
          setCertificateVisible(false);

        }}
        Code={""}
        isAll={isAll}
        rowData={rowData}
        ok={() => {
          setCertificateVisible(false);
        }}
      >

      </Certificate>
    </>
  );
}

export default LearnerSearch;
