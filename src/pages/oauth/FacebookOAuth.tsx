/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';
import { Button, Stack, Alert, Text } from '@mantine/core';
import { IconAlertCircle, IconBrandFacebook } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { UAParser } from 'ua-parser-js';

// import { USER_ROLES, UserRole } from '@/types/auth';
// import { useStoreActions } from '@/store';
import { createPortal } from 'react-dom';
import { get, post } from '../../utils/api.utils';
import Spinner from '../../components/spinner/Spinner';

enum DeviceType {
  Mobile = 1,
  Tablet = 2,
  Desktop = 3
}

interface DeviceInfo {
  deviceType: DeviceType;
  userAgent: string;
  operatingSystem: string;
  browser: string;
  lastIPAddress: string;
}

interface SimpleFacebookOAuthProps {
  isMobile?: boolean;
  appId?: string;
}

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M48 24C48 10.745 37.255 0 24 0S0 10.745 0 24c0 11.979 8.776 21.908 20.25 23.708V30.938h-6.094V24h6.094v-5.288c0-6.015 3.583-9.337 9.065-9.337 2.625 0 5.372.469 5.372.469v5.906h-3.026c-2.981 0-3.911 1.85-3.911 3.75V24h6.656l-1.064 6.938H27.75v16.77C39.224 45.908 48 35.979 48 24z"
      fill="#1877F2"
    />
    <path
      d="M33.342 30.938L34.406 24H27.75v-4.5c0-1.9.93-3.75 3.911-3.75h3.026V9.844s-2.747-.469-5.372-.469c-5.482 0-9.065 3.322-9.065 9.337V24h-6.094v6.938h6.094v16.77a24.18 24.18 0 0 0 7.5 0V30.938h5.592z"
      fill="#fff"
    />
  </svg>
);

const FacebookOAuth: React.FC<SimpleFacebookOAuthProps> = ({
  isMobile = false,
  appId = import.meta.env.VITE_FACEBOOK_APP_ID
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    deviceType: DeviceType.Desktop,
    userAgent: '',
    operatingSystem: '',
    browser: '',
    lastIPAddress: ''
  });
  const [capturedParams, setCapturedParams] = useState<{
    code: string | null;
    state: string | null;
    error: string | null;
    errorDescription: string | null;
  } | null>(null);

  const { t } = useTranslation();
  const navigate = useNavigate();
  // const {
  //   authModel: { setAuthToken },
  //   userModel: { setAuthUser, setRole }
  // } = useStoreActions((actions) => actions);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const err = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');

    if (code || err) {
      setCapturedParams({ code, state, error: err, errorDescription });
    }

    initDeviceInfo();
  }, []);

  useEffect(() => {
    if (capturedParams && deviceInfo.lastIPAddress) {
      checkForOAuthCallback(capturedParams);
    }
  }, [deviceInfo.lastIPAddress, capturedParams]);

  const getIPAddress = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return '';
    }
  };

  const initDeviceInfo = async () => {
    const parser = new UAParser(navigator.userAgent);
    const result = parser.getResult();
    let deviceType = DeviceType.Desktop;
    if (result.device.type === 'mobile') deviceType = DeviceType.Mobile;
    else if (result.device.type === 'tablet') deviceType = DeviceType.Tablet;
    const ip = await getIPAddress();
    setDeviceInfo({
      deviceType,
      userAgent: navigator.userAgent,
      operatingSystem: `${result.os.name} ${result.os.version}`,
      browser: `${result.browser.name} ${result.browser.version}`,
      lastIPAddress: ip
    });
  };

  const generateRandomState = (): string =>
    Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  const checkForOAuthCallback = (params: {
    code: string | null;
    state: string | null;
    error: string | null;
    errorDescription: string | null;
  }) => {
    if (!params.state?.startsWith('facebook_')) return;

    const { code, state, error: err, errorDescription } = params;

    if (err) {
      setError(`Authentication failed: ${errorDescription || err}`);
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (code && state) {
      const storedState = sessionStorage.getItem('facebook_oauth_state');
      if (storedState !== state) {
        setError('Invalid state parameter. Please try again.');
        sessionStorage.removeItem('facebook_oauth_state');
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
      exchangeCodeForUserData(code);
      sessionStorage.removeItem('facebook_oauth_state');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const exchangeCodeForUserData = async (code: string) => {
    setIsLoading(true);
    setError('');
    try {
      const savedUserType = sessionStorage.getItem('ms_user_type');
      sessionStorage.removeItem('ms_user_type');

      const response = await post('Authentication/facebook-verify', {
        code,
        redirectUri: `${window.location.origin}${window.location.pathname}`,
        ...deviceInfo,
        ...(savedUserType && {
          userType: savedUserType[0].toUpperCase() + savedUserType.slice(1)
        }),
      });
      if (!response.success) throw new Error(response.message?.toString());

      const authData = response.data;
      // const res = await get(`Users/user/${authData.userId}`);
      // if (!res.success) throw new Error('Failed to get user data');

      // setAuthToken(authData.token);
      // setAuthUser(res.data);
      // setRole((authData.role));
      if (authData.token) localStorage.setItem('authToken', authData.token);

      notifications.show({ title: t('success'), message: t('loginSuccessful'), color: 'green' });
      navigate('/profile');

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setError(msg);
      notifications.show({ color: 'red', title: t('error'), message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const startFacebookOAuth = () => {

    setError('');
    const state = 'facebook_' + generateRandomState();
    sessionStorage.setItem('facebook_oauth_state', state);
    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: `${window.location.origin}${window.location.pathname}`,
      response_type: 'code',
      scope: 'email,public_profile',
      state,
    });
    window.location.href = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  };

  if (error) {
    return (
      <Stack gap="xs">
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          variant="light"
          radius="md"
          styles={{
            root: { padding: '12px 14px' },
            message: { fontSize: '13px' },
          }}
        >
          <Text size="sm">{error}</Text>
        </Alert>
        <Button
          variant="outline"
          color="red"
          size="sm"
          onClick={() => setError('')}
          fullWidth
          radius="md"
        >
          {t('tryAgain')}
        </Button>
      </Stack>
    );
  }

  return (
    <>
      {isLoading && createPortal(<Spinner visible={isLoading} />, document.body)}
      <Button
        variant="outline"
        color="blue"
        onClick={startFacebookOAuth}
        fullWidth
        size={isMobile ? 'xs' : 'sm'}
        radius="md"
        leftSection={<IconBrandFacebook size={18} />}
      >
        {t('login.facebook')}
      </Button>
    </>
  );
};

export default FacebookOAuth;