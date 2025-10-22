import React, { useContext, useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Grid,
  Space,
  InputNumber,
  Result,
  Tooltip,
  Message,
  Spin,
  Tag,
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

function SearchForm(props: { onSubmit: (values: string) => void }) {
  const [form] = useForm();
  const [hasCode, setHasCode] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [cLoading, setCLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [workShopData, setWorkShopData] = useState({});
  const [remainingSpots, setRemainingSpots] = useState(0);
  const { theme, setTheme } = useContext(GlobalContext);
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
      .getWorkshopInforByCode({'Code':code})
      .then((res) => {
        setWorkShopData(res?.data[0] || {});
        console.log(res?.data[0]);
        form.setFieldsValue({SchoolName:res?.data[0].SchoolNumber});
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
              <Input
                value={code}
                placeholder="Enter the workshop code to start"
                style={{ width: '500px', height: '33px' }}
                onChange={(e) => setCode(e)}
              />
              <Button
                type="primary"
                icon={<IconSend />}
                onClick={handleClick}
              />
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
