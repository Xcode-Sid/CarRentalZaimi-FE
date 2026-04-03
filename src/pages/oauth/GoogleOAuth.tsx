/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';
import { Button, Stack, Alert, Text } from '@mantine/core';
import { IconAlertCircle, IconBrandGoogle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { UAParser } from 'ua-parser-js';
import { useAuth } from '../../contexts/AuthContext';
import { createPortal } from 'react-dom';
import Spinner from '../../components/spinner/Spinner';
import { get, post } from '../../utils/api.utils';


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

interface SimpleGoogleOAuthProps {
  isMobile?: boolean;
  clientId?: string;
}

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M47.532 24.552c0-1.636-.142-3.21-.406-4.733H24.48v9.057h13.01c-.562 2.99-2.248 5.527-4.782 7.23v6.01h7.745c4.53-4.172 7.14-10.318 7.14-17.564z" fill="#4285F4" />
    <path d="M24.48 48c6.524 0 11.996-2.163 15.994-5.883l-7.745-6.01c-2.163 1.449-4.933 2.307-8.249 2.307-6.344 0-11.715-4.283-13.634-10.045H2.876v6.198C6.856 42.48 15.067 48 24.48 48z" fill="#34A853" />
    <path d="M10.846 28.369A14.334 14.334 0 0 1 10.1 24a14.334 14.334 0 0 1 .746-4.369v-6.198H2.876A23.949 23.949 0 0 0 .48 24c0 3.864.925 7.522 2.396 10.567l7.97-6.198z" fill="#FBBC05" />
    <path d="M24.48 9.582c3.572 0 6.776 1.228 9.297 3.641l6.973-6.973C36.47 2.382 30.998 0 24.48 0 15.067 0 6.856 5.52 2.876 13.433l7.97 6.198C12.765 13.865 18.136 9.582 24.48 9.582z" fill="#EA4335" />
  </svg>
);

const GoogleOAuth: React.FC<SimpleGoogleOAuthProps> = ({
  isMobile = false,
  clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  useEffect(() => { initDeviceInfo(); }, []);
  useEffect(() => { checkForOAuthCallback(); }, [deviceInfo]);

  const getIPAddress = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      if (!response.ok) return '';
      const text = await response.text();
      if (!text) return '';
      const data = JSON.parse(text);
      return data.ip ?? '';
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

  const checkForOAuthCallback = () => {
    if (!deviceInfo.lastIPAddress) return;
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    if (!state?.startsWith('google_')) return;
    const err = urlParams.get('error');
    if (err) {
      setError(`Authentication failed: ${err}`);
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }
    if (code && state) {
      const storedState = sessionStorage.getItem('google_oauth_state');
      if (storedState !== state) {
        setError('Invalid state parameter. Please try again.');
        sessionStorage.removeItem('google_oauth_state');
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
      exchangeCodeForUserData(code);
      sessionStorage.removeItem('google_oauth_state');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };


  const exchangeCodeForUserData = async (code: string) => {
    setIsLoading(true);
    setError('');
    try {
      const savedUserType = sessionStorage.getItem('ms_user_type');
      sessionStorage.removeItem('ms_user_type');

      const response = await post('Authentication/google-verify', {
        code,
        redirectUri: `${window.location.origin}${window.location.pathname}`,
        ...deviceInfo,
        ...(savedUserType && {
          userType: savedUserType[0].toUpperCase() + savedUserType.slice(1)
        }),
      });
      if (!response.success) throw new Error(response.message?.toString());
      const authData = response.data;
      localStorage.setItem('az-token', authData.token);
      const userData = { ...authData.user, role: authData.role?.name, token: authData.token };
      localStorage.setItem('az-user', JSON.stringify(userData));
      updateProfile(userData);

      if (authData.token) localStorage.setItem('authToken', authData.token);
      notifications.show({ title: t('success'), message: t('loginSuccessful'), color: 'green' });
      navigate(authData.role === 'admin' ? '/admin' : '/account', { replace: true });

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setError(msg);
      notifications.show({ color: 'red', title: t('error'), message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const startGoogleOAuth = () => {
    setError('');

    const state = 'google_' + generateRandomState();
    sessionStorage.setItem('google_oauth_state', state);
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${window.location.origin}${window.location.pathname}`,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'online',
      prompt: 'select_account',
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
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
        color="red"
        onClick={startGoogleOAuth}
        fullWidth
        size={isMobile ? 'xs' : 'sm'}
        radius="md"
        leftSection={<IconBrandGoogle size={18} />}
      >
        {t('login.google')}
      </Button>
    </>
  );
};

export default GoogleOAuth;