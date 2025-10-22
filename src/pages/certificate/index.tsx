import React, { useState, useEffect, useMemo } from 'react';
import {
    Form,
    Grid,
    Select,
    Space,
    Modal,
    Button,
    Input,
    Checkbox,
    Message,
    Spin,
    Radio,
    Alert,
} from '@arco-design/web-react';
import { IconSearch, IconRefresh } from '@arco-design/web-react/icon'; // 确保你有正确导入图标

import * as services from '@/services';
import styles from '../my-workshop/index.module.less';
import { useSelector } from 'react-redux';
const { Row, Col } = Grid;
const certificate = ({ certificateVisible, certificateVisibleHandle, rowData, ok, Code, isAll, studentData = [] }) => {
    const [form] = Form.useForm();
    const [useDefaultEmail, setUseDefaultEmail] = useState(false);
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [deliveryMethod, setDeliveryMethod] = useState('email');
    const [validationRequired, setValidationRequired] = useState(true);
    const userInfo = useSelector((state: any) => state.userInfo);

    // Calculate assessed students count
    const assessedStudents = useMemo(() => {
        if (!isAll || !studentData.length) return [];
        return studentData.filter(s => s.CourseStatus && s.CourseStatus !== 'Not Yet Achieved');
    }, [isAll, studentData]);

    const totalStudents = studentData.length;
    const assessedCount = assessedStudents.length;

    const handleCertificateChange = (value) => {
        setSelectedCertificate(value);
    };

    const handleCheckboxChange = (e) => {
        setUseDefaultEmail(e);
    };
    const handleDownload = async (values) => {
        setLoading(true);

        const requestData = {
            StudentID: !isAll ? rowData.StudentID : void 0,
            Code: Code,
            Id: rowData?.id || rowData?.Id,
            reportType: values.type,
            NSN: values.NSN,
            deliveryMethod: 'download'
        };

        try {
            const response = await services.g.sendcertificateEmail(requestData, {
                timeout: 300000 // 5 minutes timeout
            });

            const frontendHost = window.location.origin;
            const fileUrl = `${frontendHost}${response.data}`;

            window.open(fileUrl, "_blank");

            // Show success message
            const certificateType = selectedCertificate || 'Certificate';
            const countMessage = isAll ? `for ${assessedCount} student${assessedCount !== 1 ? 's' : ''}` : `for ${rowData.FirstName || ''} ${rowData.LastName || ''}`;

            Message.success({
                content: `Certificate${isAll && assessedCount > 1 ? 's' : ''} downloaded successfully ${countMessage}`,
                duration: 3000,
            });

        } catch (error) {
            console.error('Certificate download error:', error);

            let errorMessage = 'Failed to download certificate. Please try again.';

            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                errorMessage = 'Request timed out. The certificate generation is taking longer than expected. Please try again.';
            } else if (error.response?.status === 404) {
                errorMessage = 'Certificate file not found. Please ensure the certificate has been generated.';
            } else if (error.response?.status === 500) {
                errorMessage = 'Server error occurred while generating certificate. Please try again.';
            } else if (error.response?.data) {
                // Try to extract error message from response
                try {
                    const errorText = typeof error.response.data === 'string'
                        ? error.response.data
                        : await error.response.data.text();
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorMessage;
                } catch (parseError) {
                    // Use default message if parsing fails
                }
            }

            Message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };


    const handleSubmit = (values) => {
        if (deliveryMethod === 'download') {
            handleDownload(values);
            return;
        }

        setLoading(true);

        const requestData = {
            StudentID: !isAll ? rowData.StudentID : void 0,
            Code: Code,
            email: useDefaultEmail ? userInfo.mail : values.email,
            Id: rowData?.id || rowData?.Id, // Fixed: use || instead of |
            reportType: values.type,
            NSN: values.NSN,
            deliveryMethod: 'email'
        };

        // Add timeout to the service call
        services.g
            .sendcertificateEmail(requestData, {
                timeout: 300000 // 5 minutes timeout
            })
            .then((res) => {
                if (res.data) {
                    // Better success message - get email BEFORE clearing form
                    const emailAddress = useDefaultEmail ? userInfo.mail : requestData.email;
                    const countMessage = isAll
                        ? `${assessedCount} certificate${assessedCount !== 1 ? 's' : ''}`
                        : `certificate for ${rowData.FirstName || ''} ${rowData.LastName || ''}`;

                    Message.success({
                        content: `Successfully sent ${countMessage} to ${emailAddress}`,
                        duration: 4000,
                    });

                    form.clearFields();
                    ok();
                }
            })
            .catch((error) => {
                // Better error handling
                console.error('Certificate send error:', error);

                if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                    Message.error('Request timed out. The certificate generation is taking longer than expected. Please try again.');
                } else if (error.response?.status === 500) {
                    Message.error('Server error occurred while generating certificate. Please try again.');
                } else {
                    Message.error('Failed to send certificate. Please try again.');
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleDeliveryMethodChange = (e) => {
        setDeliveryMethod(e);
        // Email is required only for email delivery method
        if (e === 'email') {
            setValidationRequired(true);
        }
        else{
            setValidationRequired(false);
        }
    };


    const handleReset = () => {
        form.resetFields();
        setUseDefaultEmail(false);
        setSelectedCertificate(null);
    };

    return (
        <>
            <Modal
                title="Generate Certificate"
                visible={certificateVisible}
                footer={null}
                onCancel={certificateVisibleHandle}
                autoFocus={false}
                focusLock={true}
                unmountOnExit={true}
            >
                <Spin tip="Just a moment..." loading={loading}>
                    {!isAll ? (
                        <p>
                            Learner Name:
                            {`${rowData.FirstName || ''} ${rowData.LastName || ''}`}
                        </p>
                    ) : (
                        <>
                            <p style={{ marginBottom: '12px' }}>Generate certificates for all learners in the workshop</p>
                            {assessedCount === 0 ? (
                                <Alert
                                    type="warning"
                                    content="No assessed students found. Please assess students before generating certificates."
                                    style={{ marginBottom: '16px' }}
                                />
                            ) : (
                                <Alert
                                    type="info"
                                    content={`${assessedCount} out of ${totalStudents} student${totalStudents !== 1 ? 's' : ''} will receive certificates. Only students with assessment status other than "Not Yet Achieved" will be included.`}
                                    style={{ marginBottom: '16px' }}
                                />
                            )}
                        </>
                    )}
                    <Form
                        form={form}
                        className={styles['search-form']}
                        layout={'vertical'}
                        labelAlign="left"
                        wrapperCol={{ span: 24 }}
                        style={{
                            display: 'inline-block',
                            marginBottom: '10px',
                        }}
                        onSubmit={handleSubmit}
                    >
                        <Row>
                            <Form.Item
                                label={'Choose Certificate'}
                                field="type"
                                rules={[{ required: true, message: 'required' }]}
                            >
                                <Select
                                    showSearch
                                    options={[
                                        {
                                            label: 'Certificate of Achievement',
                                            value: 1,
                                        },
                                        {
                                            label: 'Work Ready Skills L2 Micro-Credential',
                                            value: 2,
                                        },
                                        {
                                            label: 'Employment Skills L3 Micro-Credential',
                                            value: 3,
                                        },
                                        {
                                            label: 'Foundation Skills L1',
                                            value: 4,
                                        },
                                        {
                                            label: 'Foundation Skills L2',
                                            value: 5,
                                        },
                                    ]}
                                    placeholder="Please enter"
                                    onChange={handleCertificateChange}
                                />
                            </Form.Item>

                            <Form.Item label={'Delivery Method'}>
                                <Radio.Group
                                    value={deliveryMethod}
                                    onChange={handleDeliveryMethodChange}
                                >
                                    <Radio value="email">Send Email</Radio>
                                    <Radio value="download">Download File</Radio>
                                </Radio.Group>
                            </Form.Item>


                            <Form.Item>
                                <Checkbox
                                    checked={useDefaultEmail}
                                    onChange={handleCheckboxChange}
                                >
                                    Send to default email
                                </Checkbox>
                            </Form.Item>
                            {!useDefaultEmail && (
                                <Form.Item
                                    label={'Send to Email'}
                                    field="email"
                                    rules={[
                                        { required: validationRequired, message: 'required' },
                                        {
                                            match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                            message: 'Please enter a valid email!',
                                        },
                                    ]}
                                >
                                    <Input placeholder="Please enter email address" />
                                </Form.Item>
                            )}
                            <Form.Item style={{ textAlign: 'center' }}>
                                <Space>
                                    <Button
                                        type="primary"
                                        loading={loading}
                                        onClick={() => {
                                            form.submit();
                                        }}
                                    >
                                        {'Submit'}
                                    </Button>
                                    <Button onClick={certificateVisibleHandle}>{'Cancel'}</Button>
                                </Space>
                            </Form.Item>
                        </Row>
                    </Form>
                </Spin>
            </Modal>
        </>
    );
};

export default certificate;
