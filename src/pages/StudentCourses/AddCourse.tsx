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
import useForm from '@arco-design/web-react/es/Form/useForm';

const options = ['Work & Life Skills', 'Farming & Horticulture', 'Custom'];
function Add({ id, visibility, setVisible, studentData, list, courseData }: any) {
    const [loading, setLoading] = useState(false);
    const token = useSelector((state: any) => state.token);
    //const [assessVisible, setAssessVisible] = useState(false);
    const [aForm] = useForm();
    const [assessLoading, setAssessLoading] = useState(false);
    const [unitStanderdVisible, setUnitStanderdVisible] = useState(false);
    const [rowData, setRow] = useState<any>({});
    const [courses, setCourses] = useState<any>([]);
    const [cData, setCData] = useState<any>({});
    const [unitStandards, setUnitStandards] = useState([]);
    const [selectedType, setSelectedType] = useState(null);


    useEffect(() => {
        console.log("inti a");
        if (token) {
            console.log("inti b");
            fetchCourses();
            fetchUnits();
        }
        if (studentData) {
            console.log("inti c", studentData);
            //setAssessData(studentData);
        }
        if (id > 0) {
            aForm.setFieldsValue({ ...courseData });
            aForm.setFieldValue("Course", { value: courseData?.CourseID, label: courseData?.CourseName });
        }
        aForm.setFieldValue("CourseType", "Work & Life Skills");
        setSelectedType(0);
    }, [token, studentData, id, courseData]);

    const fetchCourses = (data = {}) => {

        setLoading(true);
        services.course
            .getCourses(data)
            .then((res) => {
                setCourses(res?.data || []);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    
    
        const fetchUnits = (data = {}) => {
            services.course.getUnits(data).then((res) => {
                setUnitStandards(res?.data || []); 
            });
        };

    const setAssessData = (data) => {
        if (!data?.Result) {
            return;
        }
        console.log("inti data");
        var availableUnits = [];
        if (data?.Result && data?.Result !== undefined) {

            console.log("inti data 2");
            var reslutObj = JSON.parse(data.Result);
            const keysArray = Object.keys(reslutObj);
            console.log(keysArray);
            services.course.getUnits(data).then((res) => {
                var unitStandrds = res?.data || [];

                for (let i = 0; i < keysArray.length; i++) {
                    var filterOpt = unitStandrds.filter((opt) => opt.UnitStandardID == parseInt(keysArray[i]));
                    if (filterOpt.length > 0) {
                        availableUnits.push({ ...filterOpt[0], UnitStandard: filterOpt[0].US });
                    }
                }
                setCData(prev => ({ ...prev, units: availableUnits }));
            });
        }
        aForm.setFieldsValue(JSON.parse(data?.Result));
    }

    const handleAssessCancel = () => {
        aForm.resetFields();
        setAssessLoading(false);
        setVisible(false);
    }

    const handleCourseSubmit = (values) => {
        setAssessLoading(true);
        console.log("id", id);
        var data = {
            id: id,
            StudentID: studentData?.StudentID,
            CourseId: values?.Course?.value,
            CourseType: values?.CourseType || '',
            ...values,
        };
        console.log("values", data);

        if (id > 0) {
            services.g
                .UpdateCourse({
                    id: id,
                    StudentID: studentData?.StudentID,
                    CourseId: values?.Course?.value,
                    CourseType: values?.CourseType || '',
                    ...values,
                })
                .then((res) => {
                    if (res?.data) {
                        setVisible(false);
                        Message.success('success');
                        aForm.resetFields();
                        list();
                    }
                })
                .finally(() => {
                    setAssessLoading(false);
                });
        }
        else {
            services.g
                .AddCourse({
                    id: id,
                    StudentID: studentData?.StudentID,
                    CourseId: values?.Course?.value,
                    CourseType: values?.CourseType || '',
                    ...values,
                })
                .then((res) => {
                    if (res?.data) {
                        setVisible(false);
                        Message.success('success');
                        aForm.resetFields();
                        list();
                    }
                })
                .finally(() => {
                    setAssessLoading(false);
                });
        }
    };


    const handleTypeChange = (value) => {
        if (value === "Work & Life Skills") {
            console.log("Select type f");
            setSelectedType(0);
        }
        else if (value === "Farming & Horticulture") {
            setSelectedType(1);
        }
        else {
            console.log("Select type t");
            setSelectedType(2);
        }
        console.log(value);
    };

    return (
        <Spin loading={loading} block>
            <Modal
                title={id > 0 ? "Edit Course" : "Add Course"}
                visible={visibility}
                footer={null}
                onCancel={handleAssessCancel}
                autoFocus={false}
                focusLock={true}
                unmountOnExit={true}
                style={{ width: '30%' }}
            >
                <Form
                    form={aForm}
                    layout={'vertical'}
                    labelAlign="left"
                    wrapperCol={{ span: 24 }}
                    onSubmit={handleCourseSubmit}
                >
                    <Form.Item label={`Learner Name`}>
                        <Input
                            value={`${studentData?.FirstName || 'a'} ${studentData?.LastName || ''
                                }`}
                            style={{ width: '100%' }}
                            disabled
                            placeholder="please enter"
                        />
                    </Form.Item>

                    <Form.Item
                        label={`Course Type`}
                        field={'CourseType'}
                        rules={[{ required: false, message: 'required' }]}
                    >
                        <Select allowClear options={options} placeholder="please enter"
                            onChange={(e) => {
                                handleTypeChange(e);
                                let fdata = {};
                                cData?.units?.forEach(itm => {
                                    var varibleName = "" + String(itm.UnitStandardID) + "";
                                    fdata[varibleName] = e;
                                });

                                aForm.setFieldsValue(fdata);
                            }} />
                    </Form.Item>
                    {(selectedType == 0 || selectedType == 2) && (<Form.Item
                        label={`Course Name`}
                        field={'Course'}
                        rules={[{ required: true, message: 'required' }]}
                    >
                        <Select
                            labelInValue
                            showSearch
                            allowClear
                            options={courses.map((it) => ({
                                label: it.CourseName,
                                value: it.CourseID,
                            }))}
                            filterOption={(inputValue, option) =>
                                option.props.value?.label
                                    ?.toLowerCase()
                                    .indexOf(inputValue.toLowerCase()) >= 0 ||
                                option.props?.children
                                    .toLowerCase()
                                    .indexOf(inputValue.toLowerCase()) >= 0
                            }
                            placeholder="please enter"
                            onChange={(e) => {
                                let fdata = {};
                                cData?.units?.forEach(itm => {
                                    var varibleName = "" + String(itm.UnitStandardID) + "";
                                    fdata[varibleName] = e;
                                });

                                aForm.setFieldsValue(fdata);
                            }} />
                    </Form.Item>)}
                    {(selectedType == 1 || selectedType == 2) && (<Form.Item
                        label={`Unit Standards`}
                        field={'UnitStandards'}
                        rules={[{ required: true, message: 'required' }]}
                    >
                        <Select
                            mode="multiple"
                            showSearch
                            allowClear
                            options={unitStandards.map((it) => ({
                                label: `${it.US} - ${it.USName}`,
                                value: it.UnitStandardID,
                            }))}
                            filterOption={(inputValue, option) =>
                                option.props.value?.label
                                    ?.toLowerCase()
                                    .indexOf(inputValue.toLowerCase()) >= 0 ||
                                option.props?.children
                                    .toLowerCase()
                                    .indexOf(inputValue.toLowerCase()) >= 0
                            }
                            placeholder="please enter"
                            onChange={(e) => {
                                let fdata = {};
                                cData?.units?.forEach(itm => {
                                    var varibleName = "" + String(itm.UnitStandardID) + "";
                                    fdata[varibleName] = e;
                                });
                                aForm.setFieldsValue(fdata);
                            }} />
                    </Form.Item>)}

                    <Form.Item style={{ textAlign: 'center' }}>
                        <Space>
                            <Button
                                loading={assessLoading}
                                type="primary"
                                htmlType="submit"
                            >
                                {'Save'}
                            </Button>
                            <Button onClick={handleAssessCancel}>
                                {'Cancel'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </Spin>
    )
}

export default Add;
