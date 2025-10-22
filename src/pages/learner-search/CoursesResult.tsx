import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  Input,
  Space,
  Descriptions,
} from '@arco-design/web-react';
import * as services from '@/services';
import {
  IconDown,
  IconPlus,
  IconRefresh,
  IconRight,
  IconSearch,
} from '@arco-design/web-react/icon';
import Row from '@arco-design/web-react/es/Grid/row';
import useForm from '@arco-design/web-react/es/Form/useForm';

const UnitManagement = ({ headerData }: any) => {
  const [units, setUnits] = useState([]);
  const [unitsData, setUnitsData] = useState([]);
  const [data, setData] = useState([]);
  const [editingUnit, setEditingUnit] = useState(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = useForm();
  const [rowData, setRow] = useState<any>({});
  // Fetch all units
  useEffect(() => {
    fetchUnits();
    fetchResult();
  }, []);

  const cleanCourseData = (courseData) => {
    if (!courseData) return [];
    // Remove the square brackets, split by commas, and remove the "GET" prefix
    const cleanedData = courseData
      .replace(/[\[\]"]/g, '')  // Remove square brackets and quotes
      .split(',')  // Split by comma to create an array
      //.map(course => course.replace(/^GET /, '').trim());  // Remove 'GET' from the start
    return cleanedData;
  };

  
    const fetchUnits = async (data = {}) => {
      setLoading(true);
      services.course
        .getUnits(data)
        .then((res) => {
          // console.log('Data Unit');
          // console.log(res?.data);
          setUnits(res?.data || []);
        })
        .finally(() => {
          setLoading(false);
        });
    };

  const fetchResult = async (data = {}) => {
    console.log('headerData');
    console.log(headerData);
    setLoading(true);
    let couseInfo = [];
    services.student
      .getStudentResults(headerData)
      .then((res) => {
        // Build complete data array first, then set state once
        const newDataItems = [];
        let idCounter = 0;

        res?.data.forEach((item) => {
          if (item.IsRemote) {
            const hospitalityCourses = cleanCourseData(item.HospitalityCourses);
            const worklifeCourses = cleanCourseData(item.WorklifeCourses);
            const farmingCourses = cleanCourseData(item.FarmingUnits);

            // Add all hospitality courses
            hospitalityCourses.forEach(course => {
              newDataItems.push({
                Id: idCounter++,
                courseName: course,
                CourseStatus: item.CourseStatus,
                LearnType: item.LearnType,
                Result: item.Result,
                IsRemote: 1,
              });
            });

            // Add all worklife courses
            worklifeCourses.forEach(course => {
              newDataItems.push({
                Id: idCounter++,
                courseName: course,
                CourseStatus: item.CourseStatus,
                LearnType: item.LearnType,
                Result: item.Result,
                IsRemote: 1,
              });
            });

            // Add all farming courses
            farmingCourses.forEach(course => {
              newDataItems.push({
                Id: idCounter++,
                courseName: course,
                CourseStatus: item.CourseStatus,
                LearnType: item.LearnType,
                Result: item.Result,
                IsRemote: 1,
              });
            });
          } else {
            newDataItems.push({
              Id: idCounter++,
              courseName: item.CourseName,
              CourseStatus: item.CourseStatus,
              LearnType: item.LearnType,
              Result: item.Result,
              IsRemote: 0,
            });
          }
        });

        // Single state update with all data
        setData(newDataItems);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const columns = [
    {
      title: 'Unit Standard',
      dataIndex: 'USName',
      key: 'USName',
      render: (_e, item) => {
        return `${item.US || ''} - ${item.USName || ''}`;
      },
    },
    {
      title: 'Result',
      dataIndex: 'UnitStatus',
      key: 'UnitStatus',
      width: 150,
    },
  ];

  const courseColumns = [
    {
      title: 'Course name',
      dataIndex: 'courseName',
    },
    {
      title: 'Learning Type',
      dataIndex: 'LearnType',
    },
    {
      title: 'Status',
      dataIndex: 'CourseStatus',
      key: 'CourseStatus',
      width: 200,
    },
  ];

  const handleRowRender = (row) => {
    //console.log("Row");
    //console.log(row);
    if (row.IsRemote == 1) {

      return (
        <>
          <Row>
            <div>No data</div>
          </Row>
        </>
      );
    }

    let detailData = [];

    if (row.Result != null) {
      let resultObj = JSON.parse(row.Result);
      Object.keys(resultObj).map(key => {
        if (key != "Course") {
          let unitFilter = units.filter(x => x.UnitStandardID == parseInt(key));
          if(unitFilter.length > 0){
            let obj = unitFilter[0];
            obj["UnitStatus"] = resultObj[key];
            detailData.push(obj)
          }
          //console.log(unitFilter)
        }
      }
      );
    }

    return (
      <>
        <Table
          rowKey={'UnitStandardID'}
          columns={columns}
          data={detailData}
          loading={loading}
        />
      </>
    );



  };



  return (
    <div>
      <Table
        rowKey={'Id'}
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
        columns={courseColumns}
        data={data}
        loading={loading}
      />
    </div>
  );
};

export default UnitManagement;
