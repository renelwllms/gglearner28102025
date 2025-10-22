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
    DatePicker,
    Space,
    Spin,
    Tabs,
} from '@arco-design/web-react';
import { IconDelete } from '@arco-design/web-react/icon'
import * as services from '@/services';
import UnitStandard from './UnitStandard';
import { useDispatch, useSelector } from 'react-redux';
import useForm from '@arco-design/web-react/es/Form/useForm';
import { Grid } from '@arco-design/web-react';

import SendResults from '../SendResults';
import { Label } from 'bizcharts';
const Row = Grid.Row
const Col = Grid.Col

const options = ['Achieved', 'Partially Completed', 'Merit', 'Excellence', 'Not Yet Achieved'];
function Assess({ id, assessVisible, setAssessVisible, studentData, assesCourseData, list }: any) {
    const [loading, setLoading] = useState(false);
    const token = useSelector((state: any) => state.token);
    //const [assessVisible, setAssessVisible] = useState(false);
    const [assesForm] = useForm();
    const [otherForm] = useForm();
    const [assessLoading, setAssessLoading] = useState(false);
    const [unitStanderdVisible, setUnitStanderdVisible] = useState(false);
    const [cData, setCData] = useState<any>({});
    const [studentUnitStaderd, setStudentUnitStaderd] = useState([]);
    const [unitStandards, setUnitStandards] = useState([]);
    const [sendResultVisible, setSendResultVisible] = useState(false);

    useEffect(() => {
        console.log("inti Assess");
        assesForm.resetFields();
        if (token) {
            console.log("inti Assess b");
            setAssessData(assesCourseData);
            //fetchUnits();
        }
        if (assesCourseData) {
            console.log("inti Assess c : ", id);
            //setAssessData(courseData);
        }
        console.log("assesCourseData");
        console.log(assesCourseData);
    }, [token, studentData, assesCourseData]);

    const fetchUnits = (data = {}) => {
        services.course.getUnits(data).then((res) => {
            setUnitStandards(res?.data || []);
        });
    };

    const addExtraUnitStandard = (data) => {

        let courseUnit = [...studentUnitStaderd.filter(item => item.IsAditional !== true), ...data];
        setStudentUnitStaderd(courseUnit);
    }

    const setAssessData = (data) => {
        services.student
            .getAllUnitStandard({
                id: id,
            })
            .then((res) => {
                setStudentUnitStaderd(res?.data || []);
                let fdata = {};
                console.log("res?.data", res?.data);
                res?.data?.forEach(itm => {
                    var varibleName = "" + String(itm.UnitStandardID) + "";
                    fdata[varibleName] = itm.UnitStatus;
                });
                console.log("assesCourseData", assesCourseData);
                var data = { ...fdata, CourseStatus: assesCourseData.CourseStatus, Note: assesCourseData.Note };
                assesForm.setFieldsValue(data);
                console.log("assesForm", data);
                otherForm.setFieldValue("CertificateRequestedDate", assesCourseData.CertificateRequestedDate)
            })
            .finally(() => {
                setLoading(false);
            });
    }

    const handleAssessCancel = () => {
        setAssessVisible(false);
    }

    const ShowUnitStanderdVisible = (visible) => {
        setUnitStanderdVisible(visible);
    }


    const handleSendResultVisible = (val) => {
        setSendResultVisible(val || false);
    }

    const handleASubmit = (values) => {
        setAssessLoading(true);

        var studentName = `${studentData?.FirstName || ''} ${studentData?.LastName || ''}`;
        var reqObj = { ...values, CourseID: assesCourseData.CourseID, id: id, CourseName: assesCourseData.CourseName, StudentName: studentName };

        services.g
            .AddAssessResult(reqObj)
            .then((res) => {
                if (res?.data) {
                    setAssessVisible(false);
                    Message.success({
                        content: `Assessment for ${studentName} in ${assesCourseData.CourseName} has been successfully saved with status: ${values.CourseStatus}`,
                        duration: 4000,
                    });
                    assesForm.resetFields();
                    list();
                } else if (res?.message) {
                    Message.error(res.message);
                }
            })
            .catch((error) => {
                console.error('Assessment error:', error);
                Message.error({
                    content: error?.response?.data?.message || 'Failed to save assessment. Please try again.',
                    duration: 4000,
                });
            })
            .finally(() => {
                setAssessLoading(false);
            });
    };


    const handleCertificateRequest = () => {
        setLoading(true);
        const now = new Date();
        const formattedDate = now.toISOString().split('T')[0];
        const studentName = `${studentData.FirstName} ${studentData.LastName}`;

        if (!assesCourseData.CourseStatus) {
            setLoading(false);
            return Message.warning({
                content: 'Cannot request certificate: Student has not been assessed yet.',
                duration: 4000,
            });
        }
        if (assesCourseData.CourseStatus === 'Not Yet Achieved') {
            setLoading(false);
            return Message.warning({
                content: 'Cannot request certificate: Course status is "Not Yet Achieved".',
                duration: 4000,
            });
        }

        var reqObj = {
            id: assesCourseData.Id,
            StudentID: studentData.StudentID,
            LEARNERNAME: studentName,
            COMPLETIONDATE: formattedDate
        };

        services.g
            .RemoteLearnerCertificateRequest(reqObj)
            .then((res) => {
                if (res?.data) {
                    otherForm.setFieldValue("CertificateRequestedDate", formattedDate);
                    Message.success({
                        content: `Certificate request for ${studentName} in ${assesCourseData.CourseName} has been successfully sent.`,
                        duration: 4000,
                    });
                } else if (res?.message) {
                    Message.error(res.message);
                }
            })
            .catch((error) => {
                console.error('Certificate request error:', error);
                Message.error({
                    content: error?.response?.data?.message || 'Failed to send certificate request. Please try again.',
                    duration: 4000,
                });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleDeleteAdditional = (unitId: number) => {
        console.log(unitId, id);
        
        // // Remove the field from the state
        // setStudentUnitStaderd(prev =>
        //     prev.filter(item => item.UnitStandardID !== unitId)
        // );

        // // Clear the value from the form
        // const values = assesForm.getFieldsValue();
        // delete values[String(unitId)];
        // assesForm.setFieldsValue(values);
    };

    return (
        <Spin loading={loading} block>
            <Modal
                title="Assess"
                visible={assessVisible}
                footer={null}
                onCancel={handleAssessCancel}
                autoFocus={false}
                focusLock={true}
                unmountOnExit={true}
                style={{ width: '50%' }}
            >

                <Row gutter={12}>
                    <Col span={11} >
                        <Form
                            form={assesForm}
                            layout={'vertical'}
                            labelAlign="left"
                            wrapperCol={{ span: 24 }}
                            onSubmit={handleASubmit}
                        >
                            <Form.Item label={'Learner Name'}>
                                <Input
                                    defaultValue={`${studentData?.FirstName || ''} ${studentData?.LastName || ''
                                        }`}
                                    style={{ width: '100%' }}
                                    disabled
                                    placeholder="please enter"
                                />
                            </Form.Item>
                            <Form.Item
                                label={`${assesCourseData?.CourseName} Full Course`}
                                field={'CourseStatus'}
                                rules={[{ required: true, message: 'required' }]}
                            >
                                <Select allowClear options={options} placeholder="please enter"
                                    onChange={(e) => {
                                        let fdata = {};
                                        studentUnitStaderd?.forEach(itm => {
                                            var varibleName = "" + String(itm.UnitStandardID) + "";
                                            fdata[varibleName] = e;
                                        });
                                        assesForm.setFieldsValue(fdata);
                                    }} />
                            </Form.Item>
                            {studentUnitStaderd?.map((itm) => {
                                return (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                            <label>{itm.IsAditional ? "Aditional" : ""}</label>
                                            {/* <Popconfirm
                                                title="Are you sure to delete?"
                                                onOk={() => handleDeleteAdditional(itm.UnitStandardID)}
                                            >
                                                <Button
                                                    size="small"
                                                    type="text"
                                                    status="danger"
                                                    icon={<IconDelete />} // optional: if you have an icon component
                                                >
                                                    Delete
                                                </Button>
                                            </Popconfirm> */}
                                        </div>
                                        <Form.Item
                                            key={itm.UnitStandardID}
                                            label={`${itm.US} - ${itm.USName}`}
                                            field={String(itm.UnitStandardID)}
                                            rules={[{ required: true, message: 'required' }]}
                                        >
                                            <Select
                                                allowClear
                                                options={options}
                                                placeholder="please enter"
                                            />
                                        </Form.Item>
                                    </>
                                );
                            })}

                            <Form.Item
                                label={'Note'}
                                field="Note"
                            >
                                <Input.TextArea
                                    allowClear
                                    style={{ width: '100%' }}
                                    placeholder="please enter"
                                    autoSize={{ minRows: 3, maxRows: 6 }}
                                />
                            </Form.Item>

                            <Form.Item style={{ textAlign: 'center' }}>
                                <Space>
                                    <Button
                                        loading={assessLoading}
                                        type="primary"
                                        onClick={() => { ShowUnitStanderdVisible(true); }}
                                    >
                                        {'Add additional US'}
                                    </Button>
                                    <Button
                                        loading={assessLoading}
                                        type="primary"
                                        htmlType="submit"
                                    >
                                        {'Submit'}
                                    </Button>
                                    <Button
                                        onClick={handleAssessCancel}
                                    >
                                        {'Cancel'}
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Col>
                    <Col span={11} >

                        <Form
                            layout={'vertical'}
                            labelAlign="left"
                            form={otherForm}
                            wrapperCol={{ span: 24 }}
                        >

                            <Form.Item
                                label={'Certificate Request Date'}
                                field="CertificateRequestedDate"
                            >
                                <DatePicker
                                    disabled
                                    format={(value) => `${value.format('DD/MM/YYYY')}`} style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item style={{ textAlign: 'center' }}>
                                <Space>
                                    <Button
                                        type="primary"
                                        style={{ marginRight: '10px' }}
                                        onClick={handleCertificateRequest}>
                                        {'Send Certificate request'}
                                    </Button>
                                    <Button
                                        type="primary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSendResultVisible(true);
                                        }}
                                    >
                                        {'Send Results'}
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>

                    </Col>
                </Row>


            </Modal>

            <UnitStandard
                id={id}
                unitVisible={unitStanderdVisible}
                setUnitVisible={ShowUnitStanderdVisible}
                studentData={studentData}
                refreshData={addExtraUnitStandard}
                studentUnitStaderd={studentUnitStaderd}

            />

            <SendResults
                sendResultVisible={sendResultVisible}
                sendResultVisibleHandle={handleSendResultVisible}
                rowData={studentData}
                isWorkshop={false}
                CourseID={assesCourseData.CourseID}
                ok={() => {
                    setSendResultVisible(false);
                }}
            >
            </SendResults>
        </Spin>

    )
}

export default Assess;
