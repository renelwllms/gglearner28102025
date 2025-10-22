import React, { useEffect, useMemo, useState } from 'react';
import {
    Button,
    Descriptions,
    Form,
    Input,
    Message,
    Modal,
    Popconfirm,
    Select,
    Space,
    Spin,
    Tabs,
} from '@arco-design/web-react';
import * as services from '@/services';
import Courses from './Courses';
import { useDispatch, useSelector } from 'react-redux';

function AllCourse({ allCourseisibility, setAllCourseVisible, studentData, getList }: any) {
    const [loading, setLoading] = useState(false);
    const token = useSelector((state: any) => state.token);
    
    useEffect(() => {
        if (token) {
        }
    }, [token, studentData]);

    
    const handleAssessCancel = () => {
        setAllCourseVisible(false);
    }
    
    return (
        <Spin loading={loading} block>
            <Modal
                title="Student All Courses"
                visible={allCourseisibility}
                footer={null}
                onCancel={handleAssessCancel}
                autoFocus={false}
                focusLock={true}
                unmountOnExit={true}
                style={{ width: '70%' }}
            >
            <Courses 
            onCancel={handleAssessCancel}
            student={studentData}
            />
            </Modal>
        </Spin>
    )
}

export default AllCourse;
