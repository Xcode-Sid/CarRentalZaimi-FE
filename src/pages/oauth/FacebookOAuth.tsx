/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';
import { Button, Stack, Alert, Text } from '@mantine/core';
import { IconAlertCircle, IconBrandFacebook } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { UAParser } from 'ua-parser-js';
import { useAuth } from '../../contexts/AuthContext';
import { createPortal } from 'react-dom';
import { get, post } from '../../utils/apiUtils';
import Spinner from '../../components/spinner/Spinner';
import PhoneNumberModal from '../../components/registration/PhoneNumberModal';
import { DeviceType, type DeviceInfo, type PendingAuthData } from '../../types/oauth';

interface SimpleFacebookOAuthProps {
  isMobile?: boolean;
  appId?: string;
}

const FacebookOAuth: React.FC<SimpleFacebookOAuthProps> = ({
  isMobile = false,
  appId = import.meta.env.VITE_FACEBOOK_APP_ID
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
  const [capturedParams, setCapturedParams] = useState<{
    code: string | null;
    state: string | null;
    error: string | null;
    errorDescription: string | null;
  } | null>(null);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { updateProfile } = useAuth();

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
      setError(`${t('oauth.authFailed')}: ${errorDescription || err}`);
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (code && state) {
      const storedState = sessionStorage.getItem('facebook_oauth_state');
      if (storedState !== state) {
        setError(t('oauth.invalidState'));
        sessionStorage.removeItem('facebook_oauth_state');
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
      exchangeCodeForUserData(code);
      sessionStorage.removeItem('facebook_oauth_state');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };


  const getRoleName = (role: PendingAuthData['role']): string =>
    typeof role === 'string' ? role : role?.name ?? '';

  const completeLogin = (authData: PendingAuthData) => {
    const roleName = getRoleName(authData.role);
    notifications.show({ title: t('success'), message: t('loginSuccessful'), color: 'green' });
    navigate(roleName === 'admin' ? '/admin' : '/account', { replace: true });
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
      localStorage.setItem('az-token', authData.token);
      const userData = { ...authData.user, role: authData.role?.name, token: authData.token };
      localStorage.setItem('az-user', JSON.stringify(userData));
      updateProfile(userData);

      if (authData.token) localStorage.setItem('authToken', authData.token);
      const phone = authData.user?.phoneNumber;
      if (!phone) {
        setPendingAuthData(authData);
        setPhoneModalOpen(true);
      } else {
        completeLogin(authData);
      }

    } catch (err) {
      const msg = err instanceof Error ? err.message : t('oauth.authFailed');
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

export default FacebookOAuth;