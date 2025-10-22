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
import { useDispatch, useSelector } from 'react-redux';
import useForm from '@arco-design/web-react/es/Form/useForm';
import { Label } from 'bizcharts';

const options = ['Achieved', 'Partially Completed', 'Merit', 'Excellence', 'Not Yet Achieved'];
function WorkShopStatus({ Code, statusVisible, setStatusVisible, WorkshopStatus, list }: any) {
    const [loading, setLoading] = useState(false);
    const token = useSelector((state: any) => state.token);
    const [statusForm] = useForm();
    const [assessLoading, setAssessLoading] = useState(false);
    
    useEffect(() => {
        console.log("inti Assess");
        statusForm.resetFields();
        if (token) {
            console.log("inti Assess b");
        }
        if(WorkshopStatus){
            statusForm.setFieldValue("Status", WorkshopStatus);
        }
    }, [token, WorkshopStatus]);

    const handleStatusCancel = () => {
        setStatusVisible(false);
    }

    const handleASubmit = (values) => {
        setAssessLoading(true);        
        var reqObj = { ...values, code: Code };
        console.log(reqObj);
        services.g
            .WorkshopStatusChange(reqObj)
            .then((res) => {
                if (res?.data) {
                    setStatusVisible(false);
                    Message.success('success');
                    list();
                }
            })
            .finally(() => {
                setAssessLoading(false);
            });
    };

    return (
        <Spin loading={loading} block>
            <Modal
                title="Change Workshop Status"
                visible={statusVisible}
                footer={null}
                onCancel={handleStatusCancel}
                autoFocus={false}
                focusLock={true}
                unmountOnExit={true}
                style={{ width: '500px' }}
            >
                <Form
                    form={statusForm}
                    layout={'vertical'}
                    labelAlign="left"
                    wrapperCol={{ span: 24 }}
                    onSubmit={handleASubmit}
                >
                <Form.Item
                    label={'Workshop Status'}
                    field="Status"
                >
                    <Select
                    allowClear
                    options={['Unprocessed', 'Processed']}
                    placeholder="please enter"
                    />
                </Form.Item>

                    <Form.Item style={{ textAlign: 'center' }}>
                        <Space>
                            <Button
                                loading={assessLoading}
                                type="primary"
                                htmlType="submit"
                            >
                                {'Submit'}
                            </Button>
                            <Button
                                onClick={handleStatusCancel}
                            >
                                {'Cancel'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </Spin>
    )
}

export default WorkShopStatus;
