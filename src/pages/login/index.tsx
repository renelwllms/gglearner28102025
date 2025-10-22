import React, { useEffect } from 'react';
import Footer from '@/components/Footer';
import styles from './style/index.module.less';
import { useMsal } from '@azure/msal-react';
import Name from '@/assets/name.png';
import { loginRequest } from '@/ms/authConfig';
function Login() {
  const { instance } = useMsal();

  function onSubmitClick() {
    instance.loginRedirect(loginRequest).catch((e) => {
      console.log(e);
    });
  }

  return (
    <div className={styles['login-main']}>
      <div className={styles.container}>
        <div className={styles['login-section']}>
          <h2>Sign In</h2>
          <button type="button" onClick={onSubmitClick}>
            Sign In with Microsoft
          </button>
        </div>

        <div className={styles['welcome-section']}>
          <h2>Welcome</h2>
          <img src={Name} alt="" />
        </div>
      </div>
    </div>
  );
}
Login.displayName = 'LoginPage';

export default Login;
