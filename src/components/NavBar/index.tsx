import React, { useContext, useEffect, useState } from 'react';
import {
  Tooltip,
  Input,
  Avatar,
  Select,
  Dropdown,
  Menu,
  Divider,
  Message,
  Button,
  Tag,
  Modal,
} from '@arco-design/web-react';
import {
  IconLanguage,
  IconSunFill,
  IconMoonFill,
  IconUser,
  IconSettings,
  IconPoweroff,
  IconUserAdd,
} from '@arco-design/web-react/icon';
import { useSelector, useDispatch } from 'react-redux';
import { GlobalContext } from '@/context';
import useLocale from '@/utils/useLocale';
import IconButton from './IconButton';
import Settings from '../Settings';
import styles from './style/index.module.less';
import defaultLocale from '@/locale';
import { useIsAuthenticated } from '@azure/msal-react';
import { useMsal } from '@azure/msal-react';
import { callMsGraph } from '@/ms/graph';
import { adminName, loginRequest } from '@/ms/authConfig';
import Name from '@/assets/name.png';
import { adminUser } from '@/services/adminUser';
import FormWizard from '@/pages/Learner/formWizard';
import useForm from '@arco-design/web-react/es/Form/useForm';
import * as services from '@/services';
import { useHistory } from 'react-router-dom';

function Navbar({ show }: { show: boolean }) {
  const t = useLocale();
  const userInfo = useSelector((state: any) => state.userInfo);
  const dispatch = useDispatch();
  const { instance, accounts } = useMsal();
  const [graphData, setGraphData] = useState<any>({});
  const isAuthenticated = useIsAuthenticated();
  const [userRoles, setUserRoles] = useState({});
  const { setLang, lang, theme, setTheme } = useContext(GlobalContext);
  const [addStudentVisible, setAddStudentVisible] = useState(false);
  const [addStudentLoading, setAddStudentLoading] = useState(false);
  const [studentForm] = useForm();
  const history = useHistory();
  const currentPath = history.location.pathname;

  function logout() {
    instance.logoutRedirect({
      postLogoutRedirectUri: '/',
    });
  }

  const getAccessToken = async () => {
    if (accounts.length > 0) {
      const account = accounts[0];

      instance
        .acquireTokenSilent({
          ...loginRequest,
          account,
        })
        .then((response) => {
          callMsGraph(response.accessToken).then((res) => {
            const data = res || {};
            setGraphData({ ...data, accessToken: response.accessToken });    
            fetchUser(data.mail); 
          });
        });
    }
  };

  function onMenuItemClick(key) {
    if (key === 'logout') {
      logout();
    } else if (key === 'user') {
    } else {
      Message.info(`You clicked ${key}`);
    }
  }
  useEffect(() => {
    const interval = setInterval(() => {
      getAccessToken();
    }, 1000 * 60 * 30);
    return () => clearInterval(interval);
  }, []);

  const init = async () =>{    
    await getAccessToken(); 
  }
  useEffect(() => {
    if (isAuthenticated) {
      init();
    }
  }, [isAuthenticated]);

  const fetchUser  = async (_email) => {
    adminUser.getByEmail({email:_email}).then((res) => {
      setUserRoles(res.data?.UserRole);
    });
  };

  const handleAddStudent = () => {
    setAddStudentVisible(true);
  };

  const handleAddStudentCancel = () => {
    setAddStudentVisible(false);
    studentForm.resetFields();
  };

  const handleStudentSubmit = (values) => {
    setAddStudentLoading(true);
    const { FirstName, LastName, SchoolName, Gender, DOB, Email, Ethnicity, Code } = values;

    services.g
      .addStudent({
        FirstName,
        LastName,
        SchoolName: SchoolName?.label,
        SchoolNumber: SchoolName?.value,
        Gender,
        DOB,
        Email,
        Ethnicity,
        Code: Code || '',
      })
      .then((res) => {
        if (res?.data) {
          setAddStudentVisible(false);
          Message.success('Student added successfully');
          studentForm.resetFields();
          // Refresh the current page if it's learner-related
          if (currentPath.includes('learner') || currentPath.includes('my-learners')) {
            window.location.reload();
          }
        }
      })
      .catch((err) => {
        Message.error(err?.response?.data?.message || 'Failed to add student');
      })
      .finally(() => {
        setAddStudentLoading(false);
      });
  };

  // Don't show Add Student button on Reports and Settings pages
  const shouldShowAddStudentButton = () => {
    return !currentPath.includes('/reports') && !currentPath.includes('/courses');
  };

  useEffect(() => {
    dispatch({
      type: 'update-userInfo',
      payload: {
        userInfo: {
          ...userInfo,
          ...graphData,
          token: void 0,
          role:userRoles,
        },
        //isAdmin: adminName?.includes(graphData?.givenName),
        isAdmin: (userRoles == "Admin"),
        //isAdmin:true,
        token: graphData.accessToken,
      },
    });
  }, [graphData, userRoles]);

  if (!show) {
    return (
      <div className={styles['fixed-settings']}>
        <Settings
          trigger={
            <Button icon={<IconSettings />} type="primary" size="large" />
          }
        />
      </div>
    );
  }

  const droplist = (
    <Menu onClickMenuItem={onMenuItemClick}>
      <Menu.Item key="user">
        <>
          <IconUser className={styles['dropdown-icon']} />
          <span className={styles['user-role']}>
            {userInfo.displayName || 'user'}
          </span>
        </>
      </Menu.Item>
      {/* <Menu.Item key="setting">
        <IconSettings className={styles['dropdown-icon']} />
        {t['menu.user.setting']}
      </Menu.Item> */}

      <Divider style={{ margin: '4px 0' }} />
      <Menu.Item key="logout">
        <IconPoweroff className={styles['dropdown-icon']} />
        {t['navbar.logout']}
      </Menu.Item>
    </Menu>
  );

  return (
    <div className={styles.navbar}>
      <div className={styles.left}>
        <div className={styles.logo}>
          <img
            src={Name}
            alt=""
            style={{
              width: '50px',
              background: theme === 'light' ? '#000' : '',
            }}
          />
          <div className={styles['logo-name']}><h1>THE GET GROUP - Portal </h1><span className={styles['app-version']}>v1.28.8.25</span></div>
          
        </div>
      </div>
      <ul className={styles.right}>
        {/* Add Student Button - visible on most pages except Reports and Settings */}
        {shouldShowAddStudentButton() && (
          <li>
            <Button
              type="primary"
              icon={<IconUserAdd />}
              onClick={handleAddStudent}
              style={{ marginRight: '12px' }}
            >
              Add Student
            </Button>
          </li>
        )}

        <li>
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
        </li>
        {/* <Settings /> */}
        {userInfo && (
          <li>
            <Dropdown droplist={droplist} position="br">
              <Avatar size={32} style={{ cursor: 'pointer' }}>
                {userInfo.displayName || <IconUser />}
              </Avatar>
            </Dropdown>
          </li>
        )}
      </ul>

      {/* Global Add Student Modal */}
      <Modal
        title="Add New Student"
        visible={addStudentVisible}
        footer={null}
        onCancel={handleAddStudentCancel}
        autoFocus={false}
        focusLock={true}
        unmountOnExit={true}
        style={{ width: '800px', maxWidth: '95vw' }}
      >
        <div style={{ maxHeight: '75vh', overflowY: 'auto', overflowX: 'hidden', padding: '0 4px' }}>
          <FormWizard
            form={studentForm}
            handleSubmit={handleStudentSubmit}
            loading={addStudentLoading}
            handleCancel={handleAddStudentCancel}
          />
        </div>
      </Modal>
    </div>
  );
}

export default Navbar;
