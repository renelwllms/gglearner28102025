import React, { useContext, useEffect, useState } from 'react';
import {
  Form,
  Input,
  Button,
  Grid,
  Result,
  Tooltip,
  Message,
  Spin,
  Notification,
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
} from '@arco-design/web-react/icon';
import useLocale from '@/utils/useLocale';
import AddForm from './form';

const { useForm } = Form;
const { Row, Col } = Grid;

const API_SUCCESS_CODE = 0;

function SearchForm(props: { onSubmit: (values: string) => void }) {
  const [form] = useForm();
  const [hasCode, setHasCode] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [cLoading, setCLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [workShopData, setWorkShopData] = useState({});
  const [remainingSpots, setRemainingSpots] = useState(0);
  const { theme, setTheme} = useContext(GlobalContext);
  const t = useLocale();
  const [schoolOption, setSchoolOption] = useState([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get('code');
    setCode(codeParam);
    setHasCode(!!codeParam);
    if (codeParam) {
      verifyWorkshopCode(codeParam);
    }
  }, []);

  const verifyWorkshopCode = async (workshopCode: string) => {
    setCLoading(true);
    try {
      const res = await services.g.verifyCode({ Code: workshopCode });
      if (res.code === API_SUCCESS_CODE) {
        getOptions();
        if (!res?.data) {
          Message.error(res?.message || 'Invalid workshop code');
          setHasCode(false);
          setCode('');
        } else {
          getWorkShopByCode(workshopCode);
        }
      } else {
        throw new Error(res?.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Failed to verify code:', error);
      Notification.error({
        title: 'Verification Failed',
        content: 'Failed to verify workshop code. Please try again.',
        duration: 5000,
      });
      setHasCode(false);
      setCode('');
    } finally {
      setCLoading(false);
    }
  };

  const getOptions = async () => {
    try {
      const res = await services.g.getSchool({});
      setSchoolOption(res?.data || []);
    } catch (error) {
      console.error('Failed to load schools:', error);
    }
  };

  const getWorkShopByCode = async (workshopCode: string) => {
    setLoading(true);
    try {
      const res = await services.g.getWorkshopInforByCode({ Code: workshopCode });
      const workshopInfo = res?.data[0] || {};
      setWorkShopData(workshopInfo);

      if (workshopInfo.SchoolName && workshopInfo.SchoolNumber) {
        const schoolObj = {
          label: workshopInfo.SchoolName,
          value: workshopInfo.SchoolNumber,
        };
        form.setFieldValue('SchoolName', schoolObj);
      }
    } catch (error) {
      console.error('Failed to load workshop info:', error);
      Notification.error({
        title: 'Error',
        content: 'Failed to load workshop information. Please try again.',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };
  function handleClick() {
    if (!code) return Message.warning('Please enter a workshop code');
    window.location.href = `/learner?code=${code}`;
  }

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const { FirstName, LastName, Gender, DOB, Email, Ethnicity } = values;
      const urlParams = new URLSearchParams(window.location.search);
      let schoolNumber = 0;
      let schoolName = '';

      // Use school from form if selected, otherwise use workshop default
      if (typeof values?.SchoolName?.value === 'number') {
        schoolName = values?.SchoolName?.label;
        schoolNumber = values?.SchoolName?.value;
      } else {
        schoolName = workShopData['SchoolName'];
        schoolNumber = workShopData['SchoolNumber'];
      }

      const postData = {
        Code: urlParams.get('code'),
        FirstName,
        LastName,
        SchoolNumber: schoolNumber,
        SchoolName: schoolName,
        Gender,
        DOB,
        Email,
        Ethnicity,
      };

      const res = await services.g.addWorkshopInfo(postData);
      if (res?.data) {
        Notification.success({
          title: 'Success',
          content: 'Your registration has been submitted successfully!',
          duration: 4000,
        });
        setDone(true);
        setRemainingSpots(res?.remainingSpots || 0);
        form.resetFields();

        const schoolObj = {
          label: schoolName,
          value: schoolNumber,
        };
        form.setFieldValue('SchoolName', schoolObj);
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('Failed to submit registration:', error);
      Notification.error({
        title: 'Registration Failed',
        content: 'Failed to submit your registration. Please try again.',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

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
            <div className={styles['logo-name']}>Registration Form</div>
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '60vh',
              padding: '20px',
            }}
          >
            <Row justify="center" style={{ width: '100%' }}>
              <Col xs={24} sm={20} md={16} lg={12} xl={10}>
                <Input.Search
                  value={code}
                  placeholder="Enter the workshop code to start registration"
                  onChange={(e) => setCode(e)}
                  searchButton={
                    <Tooltip content="Start registration">
                      <Button type="primary" icon={<IconSend />} loading={loading} />
                    </Tooltip>
                  }
                  onSearch={handleClick}
                  size="large"
                />
              </Col>
            </Row>
          </div>
        ) : (
          <>
            {done ? (
              <div style={{ padding: '40px 20px' }}>
                <Result
                  status="success"
                  title="Registration Successful!"
                  subTitle={
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                      <p style={{ fontSize: '16px', marginBottom: '12px' }}>
                        Your registration has been submitted successfully.
                      </p>
                      <p style={{ fontSize: '14px', color: '#86909c', marginBottom: '20px' }}>
                        Please do not submit multiple registrations.
                      </p>
                      <div
                        style={{
                          background: '#f7f8fa',
                          padding: '20px',
                          borderRadius: '8px',
                          display: 'inline-block',
                          marginTop: '10px',
                        }}
                      >
                        <p style={{ fontSize: '14px', marginBottom: '8px', color: '#4e5969' }}>
                          Remaining spots in this workshop:
                        </p>
                        <span
                          style={{
                            color: '#00b42a',
                            fontSize: '32px',
                            fontWeight: 'bold',
                          }}
                        >
                          {remainingSpots || 0}
                        </span>
                      </div>
                    </div>
                  }
                  extra={[
                    <Button
                      key="register-another"
                      type="primary"
                      size="large"
                      onClick={() => {
                        setDone(false);
                      }}
                    >
                      Register Another Learner
                    </Button>,
                  ]}
                />
              </div>
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
