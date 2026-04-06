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
import PhoneNumberModal from '../../components/registration/PhoneNumberModal';


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

interface PendingAuthData {
  token: string;
  user: Record<string, unknown>;
  role: { name: string } | string;
}

const GoogleOAuth: React.FC<SimpleGoogleOAuthProps> = ({
  isMobile = false,
  clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [pendingAuthData, setPendingAuthData] = useState<PendingAuthData | null>(null);

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

      console.log('authData.user',authData.user)
      if (authData.token) localStorage.setItem('authToken', authData.token);
      const phone = authData.user?.phoneNumber;
      if (!phone) {
        setPendingAuthData(authData);
        setPhoneModalOpen(true);
      } else {
        completeLogin(authData);
      }

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setError(msg);
      notifications.show({ color: 'red', title: t('error'), message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleName = (role: PendingAuthData['role']): string =>
    typeof role === 'string' ? role : role?.name ?? '';

  const completeLogin = (authData: PendingAuthData) => {
    const roleName = getRoleName(authData.role);
    notifications.show({ title: t('success'), message: t('loginSuccessful'), color: 'green' });
    navigate('/account', { replace: true });
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
      {pendingAuthData && (
        <PhoneNumberModal
          opened={phoneModalOpen}
          userId={(pendingAuthData.user as Record<string, unknown>).id as string}
          onClose={() => setPhoneModalOpen(false)}
          onSuccess={() => {
            setPhoneModalOpen(false);
            completeLogin(pendingAuthData);
          }}
        />
      )}
    </>
  );
};

export default GoogleOAuth;