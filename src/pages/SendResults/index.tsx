import React, { useEffect, useState } from 'react';
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
} from '@arco-design/web-react';
import { IconSearch, IconRefresh } from '@arco-design/web-react/icon'; // 确保你有正确导入图标

import * as services from '@/services';
import styles from '../my-workshop/index.module.less';
import { useSelector } from 'react-redux';
const { Row, Col } = Grid;
const SendResults = ({ sendResultVisible, sendResultVisibleHandle, rowData, ok, isWorkshop, CourseID = null }) => {
    const [form] = Form.useForm();
    const [useDefaultEmail, setUseDefaultEmail] = useState(false);
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [loading, setLoading] = useState(false);
    const userInfo = useSelector((state: any) => state.userInfo);

    useEffect(() => {
        console.log(rowData);
    }

    );

    const handleSubmit = (values) => {
        setLoading(true);
        const emailAddress = useDefaultEmail ? userInfo.mail : values.email;
        const studentName = isWorkshop
            ? `workshop ${rowData?.Code}`
            : `${rowData?.FirstName || ''} ${rowData?.LastName || ''}`;

        services.g
            .sendResultEmail({
                email: emailAddress,
                reportType: values.type,
                StudentID: isWorkshop ? 0 : rowData?.StudentID,
                code: isWorkshop ? rowData?.Code : "",
                CourseID: CourseID,
            })
            .then((res) => {
                if (res.data) {
                    form.clearFields();
                    Message.success({
                        content: `Results for ${studentName} have been successfully sent to ${emailAddress}`,
                        duration: 4000,
                    });
                    ok();
                } else if (res?.message) {
                    Message.error(res.message);
                }
            })
            .catch((error) => {
                console.error('Send results error:', error);
                let errorMessage = 'Failed to send results. Please try again.';

                if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
                    errorMessage = 'Request timed out. Please try again.';
                } else if (error.response?.status === 404) {
                    errorMessage = 'Student or course data not found.';
                } else if (error.response?.status === 500) {
                    errorMessage = 'Server error occurred. Please try again later.';
                } else if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                }

                Message.error({
                    content: errorMessage,
                    duration: 4000,
                });
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleCheckboxChange = (e) => {
        setUseDefaultEmail(e);
    };


    return (
        <>
            <Modal
                title="Send Result"
                visible={sendResultVisible}
                footer={null}
                onCancel={sendResultVisibleHandle}
                autoFocus={false}
                focusLock={true}
                unmountOnExit={true}
            >
                <Spin tip="Just a moment..." loading={loading}>
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
                            <Form.Item>
                                <Checkbox
                                    checked={useDefaultEmail}
                                    onChange={handleCheckboxChange}
                                >
                                    Send to default email
                                </Checkbox>
                            </Form.Item>
                            {useDefaultEmail ? (
                                <p>
                                    Email :
                                    {` ${userInfo.mail || ''}`}
                                </p>
                            ) : (
                                <Form.Item
                                    label={'Send to Email'}
                                    field="email"
                                    rules={[
                                        { required: true, message: 'required' },
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
                                    <Button onClick={() => { sendResultVisibleHandle(false); }}>{'Cancel'}</Button>
                                </Space>
                            </Form.Item>
                        </Row>
                    </Form>
                </Spin>
            </Modal>
        </>
    );
};

export default SendResults;
