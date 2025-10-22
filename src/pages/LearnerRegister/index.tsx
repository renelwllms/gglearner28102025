import React, { useContext, useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Grid,
  Space,
  Result,
  Tooltip,
  Message,
  Spin,
  Steps,
  Checkbox,
  Radio,
} from '@arco-design/web-react';
import styles from './index.module.less';
import * as services from '@/services';
import Name from '@/assets/name.png';
import { GlobalContext } from '@/context';
import IconButton from '@/components/NavBar/IconButton';
import {
  IconMoonFill,
  IconSend,
  IconSunFill,
  IconLeft, IconRight
} from '@arco-design/web-react/icon';
import useLocale from '@/utils/useLocale';
import AddForm from './form';

const { useForm } = Form;
const Step = Steps.Step;
const Row = Grid.Row
const Col = Grid.Col


function SearchForm(props: { onSubmit: (values: string) => void }) {
  const [form] = useForm();
  const [hasCode, setHasCode] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [cLoading, setCLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [workShopData, setWorkShopData] = useState({});
  const [remainingSpots, setRemainingSpots] = useState(0);
  const [current, setCurrent] = useState(1);
  const { theme, setTheme } = useContext(GlobalContext);
  const [schoolOption, setSchoolOption] = useState([]);
  const [courseOption, setCourse] = useState([]);
  const [farmingCourseVal, setFarmingCourseVal] = useState<any>({});
  const [hospitalityCourseVal, setHospitalityCourseVal] = useState<any>({});
  const [worklifeCourseVal, setWorklifeCourseVal] = useState<any>({});

  const t = useLocale();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const c = urlParams.get('code');
    setCode(c);
    setHasCode(!!c);
    if (c) {
      setCLoading(true);
      services.g
        .verifyCode({
          Code: c,
        })
        .then((res) => {
          if (res.code === 0) {
            if (!res?.data) {
              Message.error(res?.message);
              setHasCode(false);
              setCode('');

            }

            setCLoading(false);
            getWorkShopByCode(c);
          }
        });
    }
  }, []);

  const getWorkShopByCode = (code) => {
    setLoading(true);
    services.g
      .getWorkshopInforByCode({ 'Code': code })
      .then((res) => {
        setWorkShopData(res?.data[0] || {});
        console.log(res?.data[0]);
        form.setFieldsValue({ SchoolName: res?.data[0].SchoolNumber });
      })
      .finally(() => {
        setLoading(false);
      });
  };
  function handleClick() {
    if (!code) return Message.warning('Please Enter');
    window.location.href = `/learner?code=${code}`;
  }

  const handleSubmit = (values) => {
    setLoading(true);
    // const Feedback = {};
    // topic.forEach((e) => {
    //   Feedback[e.title] = values[e.title];
    // });
    const { FirstName, LastName, Gender, DOB, Email, Ethnicity } =
      values;
    const urlParams = new URLSearchParams(window.location.search);
    let SchoolNumber = values?.SchoolName?.value;
    let SchoolName = values?.SchoolName?.label;
    if (typeof values?.SchoolName?.value !== 'number') {
      SchoolNumber = 0;
      SchoolName = values?.SchoolName?.value;
    }
    services.g
      .addWorkshopInfo({
        Code: urlParams.get('code'),
        FirstName,
        LastName,
        SchoolNumber,
        SchoolName,
        Gender,
        DOB,
        Email,
        Ethnicity,
        // Feedback: JSON.stringify(Feedback),
      })
      .then((res) => {
        if (res?.data) {
          setDone(true);
          setRemainingSpots(res?.remainingSpots);
          form.resetFields();
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };
  function renderContent(step) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          textAlign: 'center',
          background: 'var(--color-bg-2)',
          color: '#C2C7CC',
        }}
      >
        {step == 1 ? <>
          <Form
            form={form}
            className={styles['search-form']}
            labelAlign="left"
            wrapperCol={{ span: 24 }}
            onSubmit={handleSubmit}
          >
            <Form.Item
              label={'First Name'}
              field="FirstName"
              rules={[{ required: true, message: 'required' }]}
            >
              <Input
                allowClear
                style={{ width: '100%' }}
                placeholder="please enter"
              />
            </Form.Item>
            <Form.Item
              label={'Last Name'}
              field="LastName"
              rules={[{ required: true, message: 'required' }]}
            >
              <Input
                allowClear
                style={{ width: '100%' }}
                placeholder="please enter"
              />
            </Form.Item>
            <Form.Item
              label={'Date of Birth'}
              field="DateOfBirth"
              rules={[{ required: true, message: 'required' }]}
            >
              <DatePicker format={(value) => `${value.format('DD/MM/YYYY')}`} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label={'Gender'}
              field="Gender"
              rules={[{ required: true, message: 'required' }]}
            >
              <Select
                allowClear
                options={['Male', 'Female', 'Other']}
                placeholder="please enter"
              />
            </Form.Item>

            <Form.Item
              label={'Ethnicity'}
              field="Ethnicity"
              rules={[{ required: true, message: 'required' }]}
            >
              <Select
                allowClear
                allowCreate
                showSearch
                options={[
                  'Australian',
                  'British',
                  'Cambodian',
                  'Chinese',
                  'Chinese',
                  'Cook Island',
                  'Dutch',
                  'Fijian',
                  'German',
                  'Indian',
                  'Italian',
                  'Japanese',
                  'Korean',
                  'American',
                  'NZ European',
                  'Maori',
                  'Polish',
                  'Samoan',
                  'Tongan',
                ]}
                placeholder="please select (If the option does not exist, you can enter it manually)"
              />
            </Form.Item>

            <Form.Item
              label={'Phone Number'}
              field="PhoneNumber"
              rules={[{ required: true, message: 'required' }]}
            >
              <Input
                allowClear
                style={{ width: '100%' }}
                placeholder="please enter"
              />
            </Form.Item>
            <Form.Item
              label={'Email'}
              field="Email"
              rules={[{ required: true, message: 'required' }]}
            >
              <Input
                allowClear
                style={{ width: '100%' }}
                placeholder="please enter"
              />
            </Form.Item>

            <Form.Item
              label={'School Name'}
              field="School"
              rules={[{ required: false, message: 'required' }]}
            >
              <Select
                showSearch
                allowClear
                options={schoolOption.map((it) => ({
                  label: it.SchoolName,
                  value: it.SchoolName,
                }))}
                allowCreate={{
                  formatter: (inputValue) => {
                    return {
                      value: inputValue,
                      label: inputValue,
                    };
                  },
                }}
                filterOption={(inputValue, option) =>
                  option.props.value?.label
                    ?.toLowerCase()
                    .indexOf(inputValue.toLowerCase()) >= 0 ||
                  option.props?.children
                    .toLowerCase()
                    .indexOf(inputValue.toLowerCase()) >= 0
                }
                placeholder="please select (If the option does not exist, you can enter it manually)"
              />
            </Form.Item>

            <Form.Item
              label={'Teacher Name'}
              field="TeacherName"
              rules={[{ required: false, message: 'required' }]}
            >
              <Input
                allowClear
                style={{ width: '100%' }}
                placeholder="please enter"
              />
            </Form.Item>
            <Form.Item
              label={'Teacher Name'}
              field="TeacherName"
            >
              <Input
                allowClear
                style={{ width: '100%' }}
                placeholder="please enter"
              />
            </Form.Item>
            <Form.Item
              label={'Teacher Email'}
              field="TeacherEmail"
              rules={[{ required: false, message: 'required' }]}
            >
              <Input
                allowClear
                style={{ width: '100%' }}
                placeholder="please enter"
              />
            </Form.Item>
            <Form.Item
              label={'Other Email'}
              field="OtherEmail"
              rules={[{ required: false, message: 'required' }]}
            >
              <Input
                allowClear
                style={{ width: '100%' }}
                placeholder="please enter"
              />
            </Form.Item>
            <Form.Item
              label={'Please choose your preferred WORKBOOK option'}
              field="WorkBookOption"
              rules={[{ required: false, message: 'required' }]}
            >
              <Checkbox>I would like a writable electronic workbook emailed to me ($180.00 +GST per workbook)</Checkbox>  <br />
              <Checkbox>I would like a hard copy workbook printed and couriered to me ($200.00 +GST per workbook) </Checkbox>
            </Form.Item>
            <Form.Item
              label={'Address'}
              field="Address"
              rules={[{ required: false, message: 'required' }]}
            >
              <Input
                allowClear
                style={{ width: '100%' }}
                placeholder="please enter"
              />
            </Form.Item>
            <Form.Item
              label={'Will your school be resulting the credits with NZQA or will you need us to do that for you?'}
              field="SchoolResultOption"
              rules={[{ required: false, message: 'required' }]}
            >
              <Radio>My school will be resulting the credits with NZQA</Radio><br />
              <Radio>I will need The GET Group to result the credits with NZQA. (I am aware there will be an extra cost associated with this)</Radio><br />
              <Radio>I am not sure</Radio><br />
            </Form.Item>
            <Form.Item
              label={'Is there any additional information you would like to share? '}
              field="AdditionalInformation"
              rules={[{ required: false, message: 'required' }]}
            >
              <Input
                allowClear
                style={{ width: '100%' }}
                placeholder="please enter"
              />
            </Form.Item>
          </Form></> : <></>}

        <div>
          <Button
            type='secondary'
            disabled={current <= 1}
            onClick={() => setCurrent(current - 1)}
            style={{ paddingLeft: 8 }}
          >
            <IconLeft />
            Back
          </Button>
          <Button
            onClick={() => setCurrent(current + 1)}
            style={{ marginLeft: 20, paddingRight: 8 }}
            type='primary'
          >
            {current > 3 ? "Submit" : "Next"}
            {current && current < 4 ? (<IconRight />) : (<IconSend />)}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {cLoading ? (
        <Spin
          tip="Verification in progress..."
          block
          loading={cLoading}
          style={{
            width: '100vw',
            height: '100vh',
            position: 'fixed',
            zIndex: '999',
            background: 'rgba(255,255,255,0.3)',
          }}
        >
          <div></div>
        </Spin>
      ) : (
        <></>
      )}

      <div
        className={cLoading ? styles['cLoading-form'] : ''}
        style={{ padding: '20px' }}
      >
        <div>
          <div className={styles.logo}>
            <img
              src={Name}
              alt=""
              style={{
                width: '50px',
                background: theme === 'light' ? '#000' : '',
              }}
            />
            <div className={styles['logo-name']}>Individual Remote Learner Registration</div>
          </div>
          <div style={{ position: 'absolute', right: '30px', top: '20px' }}>
            <Tooltip
              content={
                theme === 'light'
                  ? t['settings.navbar.theme.toDark']
                  : t['settings.navbar.theme.toLight']
              }
            >
              <IconButton
                icon={theme !== 'dark' ? <IconMoonFill /> : <IconSunFill />}
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              />
            </Tooltip>
          </div>
        </div>
        {!hasCode ? (
          <>
            <div
              style={{
                textAlign: 'center',
                position: 'absolute',
                top: '45%',
                left: '50%',
                transform: 'translate(-50%,-50%)',
                width: '600px',
              }}
            >

              <div
                style={{
                  maxWidth: 780,
                }}
              >
                <Steps current={current}>
                  <Step title='' />
                  <Step title='' />
                  <Step title='' />
                  <Step title='' />
                </Steps>
                {renderContent(current)}
              </div>
            </div>
          </>
        ) : (
          <>
            {done ? (
              <>
                <Result
                  status="success"
                  title="Thank you"
                  subTitle={
                    <>
                      <p>Your form was submitted successfully.</p>
                      <p>Please do not submit multiple times.</p>
                      <p>
                        Remaining vacancies in the workshop:
                        <span
                          style={{
                            color: '#ED45A0',
                            fontSize: '18px',
                            position: 'relative',
                            top: '3px',
                            left: '2px',
                          }}
                        >
                          {remainingSpots || 0}
                        </span>
                      </p>
                    </>
                  }
                  extra={[
                    <Button
                      key="back"
                      type="primary"
                      onClick={() => setDone(false)}
                    >
                      Again
                    </Button>,
                  ]}
                ></Result>
              </>
            ) : (
              <div className={styles['search-form-wrapper']}>
                <AddForm
                  form={form}
                  handleSubmit={handleSubmit}
                  loading={loading}
                ></AddForm>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default SearchForm;
