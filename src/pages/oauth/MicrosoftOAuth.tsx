/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';
import { Button, Stack, Alert, Text } from '@mantine/core';
import { IconAlertCircle, IconBrandWindows } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { UAParser } from 'ua-parser-js';
import { useAuth } from '../../contexts/AuthContext';
import { createPortal } from 'react-dom';
import { get, post } from '../../utils/api.utils';
import Spinner from '../../components/spinner/Spinner';
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

interface SimpleMicrosoftOAuthProps {
  clientId?: string;
  tenantId?: string;
  isMobile?: boolean;
}

interface PendingAuthData {
  token: string;
  user: Record<string, unknown>;
  role: { name: string } | string;
}

const MicrosoftOAuth: React.FC<SimpleMicrosoftOAuthProps> = ({
  clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID,
  tenantId = import.meta.env.VITE_MICROSOFT_TENANT_ID,
  isMobile = false,
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


  const [capturedParams] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      code: urlParams.get('code'),
      state: urlParams.get('state'),
      error: urlParams.get('error'),
      errorDescription: urlParams.get('error_description'),
    };
  });

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { updateProfile } = useAuth();

  useEffect(() => { initDeviceInfo(); }, []);


  useEffect(() => {
    if (!capturedParams.state?.startsWith('microsoft_')) return;
    if (!deviceInfo.lastIPAddress) return;

    const { code, state, error: errorParam, errorDescription } = capturedParams;

    if (errorParam) {
      setError(`Authentication failed: ${errorDescription || errorParam}`);
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (code && state) {
      const storedState = sessionStorage.getItem('ms_state');
      const codeVerifier = sessionStorage.getItem('ms_verifier');

      if (!storedState || !codeVerifier || storedState !== state) {
        setError('Invalid session. Please try again.');
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      sessionStorage.removeItem('ms_state');
      sessionStorage.removeItem('ms_verifier');
      sessionStorage.removeItem('ms_redirect_uri');

      window.history.replaceState({}, document.title, window.location.pathname);
      exchangeCodeForToken(code, codeVerifier);
    }
  }, [deviceInfo.lastIPAddress]);

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

  const generateRandomString = (length = 32): string => {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  const generateCodeChallenge = async (verifier: string): Promise<string> => {
    const data = new TextEncoder().encode(verifier);
    const hashed = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(hashed)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };


  const exchangeCodeForToken = async (code: string, codeVerifier: string) => {
    setIsLoading(true);
    setError('');

    try {
      const redirectUri = sessionStorage.getItem('ms_redirect_uri') ||
        `${window.location.origin}${window.location.pathname}`;

      const savedUserType = sessionStorage.getItem('ms_user_type');
      sessionStorage.removeItem('ms_user_type');

      const response = await post('Authentication/microsoft-verify', {
        code,
        codeVerifier,
        redirectUri,
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
    navigate(roleName === 'admin' ? '/admin' : '/account', { replace: true });
  };


  const startOAuth = async () => {
    setError('');

    sessionStorage.removeItem('google_oauth_state');
    sessionStorage.removeItem('facebook_oauth_state');
    sessionStorage.removeItem('yahoo_oauth_state');
    sessionStorage.removeItem('yahoo_oauth_verifier');

    const state = 'microsoft_' + generateRandomString(16);
    const codeVerifier = generateRandomString(32);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const redirectUri = `${window.location.origin}${window.location.pathname}`;

    sessionStorage.setItem('ms_state', state);
    sessionStorage.setItem('ms_verifier', codeVerifier);
    sessionStorage.setItem('ms_redirect_uri', redirectUri);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      response_mode: 'query',
      scope: 'User.Read openid profile email',
      state,
      prompt: 'select_account',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    window.location.href = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params}`;
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
        color="indigo"
        onClick={startOAuth}
        fullWidth
        size={isMobile ? 'xs' : 'sm'}
        radius="md"
        leftSection={<IconBrandWindows size={18} />}
      >
        {t('login.microsoft')}
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

export default MicrosoftOAuth;