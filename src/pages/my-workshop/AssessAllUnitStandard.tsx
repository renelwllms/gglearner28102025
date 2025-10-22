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
const FormItem = Form.Item;
const Option = Select.Option;
import * as services from '@/services'; 
import { useDispatch, useSelector } from 'react-redux';
import useForm from '@arco-design/web-react/es/Form/useForm';

const options = ['Achieved', 'Partially Completed', 'Merit', 'Excellence', 'Not Yet Achieved'];
function UnitStandard({ id, unitVisible, setUnitVisible, studentData, assesCourseData, refreshData, studentUnitStaderd }: any) {
    const [loading, setLoading] = useState(false);
    const token = useSelector((state: any) => state.token);
    //const [assessVisible, setAssessVisible] = useState(false);
    const [unitStanderdForm] = useForm();
    const [unitStanderdLoading, setUnitStanderdLoading] = useState(false);
    const [cData, setCData] = useState<any>({});
    const [unitStandards, setUnitStandards] = useState([]);


    useEffect(() => {
        console.log("inti Assess");
        if (token) {
            console.log("inti Assess b");
            fetchUnits(assesCourseData);
            //fetchUnits();
        }
        if (assesCourseData) {
            console.log("inti Assess c : ", id);
            //setAssessData(courseData);
        }

    }, [token, studentData, assesCourseData, studentUnitStaderd]);



    const fetchUnits = (data = {}) => {
        services.course.getUnits(data).then((res) => {
            setUnitStandards(res?.data || []);

            console.log("Alll aditional unitstd", studentUnitStaderd);
            if(studentUnitStaderd){
                var flt = studentUnitStaderd.filter((opt) => opt.IsAditional == true)
                .map((opt) => opt.UnitStandardID);

                unitStanderdForm.setFieldValue("UnitStandardIDs", flt);
            }
        });
    };
    

    const handleAddUnitStanderdSubmit = (values) => {
        setUnitStanderdLoading(true);
        var availableUnits = [];
        values?.UnitStandardIDs?.forEach(unitStanderdId => {
            console.log(unitStanderdId);
            var filterOpt = unitStandards.filter((opt) => opt.UnitStandardID == unitStanderdId);
            if (filterOpt.length > 0) {
                availableUnits.push({ ...filterOpt[0], UnitStandard: filterOpt[0].US, IsAditional: true });
            }
        });
        refreshData(availableUnits);
        setUnitVisible(false);
        setUnitStanderdLoading(false);
    };

    return (
        <Spin loading={loading} block><Modal
            title="Unit Standard"
            visible={unitVisible}
            footer={null}
            onCancel={() => { setUnitVisible(false); }}
            autoFocus={false}
            focusLock={true}
            unmountOnExit={true}
            style={{ width: '500px', height:'50%' }}
        >
            <Form
                form={unitStanderdForm}
                layout={'vertical'}
                labelAlign="left"
                wrapperCol={{ span: 24 }}
                onSubmit={handleAddUnitStanderdSubmit}
            >
                <FormItem label="Unit Standards" field="UnitStandardIDs">
                    <Select
                        mode="multiple"
                        placeholder="Select unit standards"
                        allowClear
                        showSearch

                        options={unitStandards?.map((it) => ({
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


                    >
                        {/* {unitStandards.map((us) => (
                            <Option key={us.UnitStandardID} value={us.UnitStandardID}>
                                {us.US} - {us.USName}
                            </Option>
                        ))} */}
                    </Select>
                </FormItem>
                <Form.Item style={{ textAlign: 'center', marginTop:'50%' }}>
                    <Space>
                        <Button
                            loading={unitStanderdLoading}
                            type="primary"
                            htmlType="submit"
                        >
                            {'Submit'}
                        </Button>
                        <Button
                            onClick={() => { setUnitVisible(false); }}
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

export default UnitStandard;
