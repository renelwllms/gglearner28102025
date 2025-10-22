import './style/global.less';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { ConfigProvider } from '@arco-design/web-react';
import zhCN from '@arco-design/web-react/es/locale/zh-CN';
import enUS from '@arco-design/web-react/es/locale/en-US';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import store from './store';
import PageLayout from './layout';
import Learner from './pages/Learner';
import LearnerRegistration from './pages/LearnerRegister';
import RemoteRegister from './pages/RemoteRegister';
import { GlobalContext } from './context';
import Login from './pages/login';
import changeTheme from './utils/changeTheme';
import useStorage from './utils/useStorage';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider, useMsal  } from '@azure/msal-react';
import { useIsAuthenticated } from '@azure/msal-react';
import { msalConfig } from '@/ms/authConfig';
import { adminUser } from '@/services/adminUser';
const msalInstance = new PublicClientApplication(msalConfig);

function Index() {
  const [lang, setLang] = useStorage('arco-lang', 'en-US');
  const [theme, setTheme] = useStorage('arco-theme', 'light');
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const userEmail = accounts.length > 0 ? accounts[0].username : "Not signed in";
  const [activeUser, setActiveUser] = useState({});
  const [tokenInitialized, setTokenInitialized] = useState(false);

  function getArcoLocale() {
    switch (lang) {
      case 'zh-CN':
        return zhCN;
      case 'en-US':
        return enUS;
      default:
        return zhCN;
    }
  }

  useEffect(() => {
    changeTheme(theme);
  }, [theme]);

  // Initialize token from MSAL on app load
  useEffect(() => {
    const initializeAuth = async () => {
      if (isAuthenticated && accounts.length > 0) {
        try {
          const account = accounts[0];
          const response = await instance.acquireTokenSilent({
            scopes: ['User.Read'],
            account,
          });

          // Store token in Redux immediately on app initialization
          store.dispatch({
            type: 'update-userInfo',
            payload: {
              userInfo: {},
              token: response.accessToken,
              isAdmin: false,
            },
          });

          setTokenInitialized(true);
        } catch (error) {
          console.error('Failed to acquire token silently:', error);
          setTokenInitialized(true); // Set to true anyway to avoid infinite loading
        }
      } else {
        setTokenInitialized(true);
      }
    };

    initializeAuth();
  }, [isAuthenticated, accounts, instance]);

  useEffect(() => {/*
    if(isAuthenticated == true){
      console.log("UserData isAuthenticated : ", isAuthenticated);
      fetchUser();
      console.log("UserData Email : ", userEmail);
    }*/
  },[isAuthenticated])

  const fetchUser  = async () => {
    adminUser.getByEmail({email:userEmail}).then((res) => {
      setActiveUser(res.data);
      console.log("UserData info", res.data);
    });
  };

  const contextValue = {
    lang,
    setLang,
    theme,
    setTheme,
  };

  return (
    <ConfigProvider
      locale={getArcoLocale()}
      componentConfig={{
        Card: {
          bordered: false,
        },
        List: {
          bordered: false,
        },
        Table: {
          border: false,
        },
      }}
    >
      <Provider store={store}>
        <GlobalContext.Provider value={contextValue}>
          <Switch>
            <Route path="/learner" component={Learner} />
            <Route path="/LearnerRegistration" component={LearnerRegistration} />
            <Route path="/remote-register" component={RemoteRegister} />
            <Route path="/" component={isAuthenticated && tokenInitialized ? PageLayout : Login} />
          </Switch>
        </GlobalContext.Provider>
      </Provider>
    </ConfigProvider>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <MsalProvider instance={msalInstance}>
        <Index />
      </MsalProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
