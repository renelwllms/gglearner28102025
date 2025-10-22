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
} from '@arco-design/web-react';
import {
  IconLanguage,
  IconSunFill,
  IconMoonFill,
  IconUser,
  IconSettings,
  IconPoweroff,
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

function Navbar({ show }: { show: boolean }) {
  const t = useLocale();
  const userInfo = useSelector((state: any) => state.userInfo);
  const dispatch = useDispatch();
  const { instance, accounts } = useMsal();
  const [graphData, setGraphData] = useState<any>({});
  const isAuthenticated = useIsAuthenticated();
  const [userRoles, setUserRoles] = useState({});
  const { setLang, lang, theme, setTheme } = useContext(GlobalContext);

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
        {/* <li>
          <Input.Search
            className={styles.round}
            placeholder={t['navbar.search.placeholder']}
          />
        </li> */}
        {/* <li>
          <Select
            triggerElement={<IconButton icon={<IconLanguage />} />}
            options={[
              { label: 'English', value: 'en-US' },
              { label: '中文', value: 'zh-CN' },
            ]}
            value={lang}
            triggerProps={{
              autoAlignPopupWidth: false,
              autoAlignPopupMinWidth: true,
              position: 'br',
            }}
            trigger="hover"
            onChange={(value) => {
              setLang(value);
              const nextLang = defaultLocale[value];
              Message.info(`${nextLang['message.lang.tips']}${value}`);
            }}
          />
        </li> */}
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
    </div>
  );
}

export default Navbar;
