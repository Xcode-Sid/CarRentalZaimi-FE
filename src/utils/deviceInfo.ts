import { UAParser } from 'ua-parser-js';
import { DeviceType, type DeviceInfo } from '../types/oauth';

async function getIPAddress(): Promise<string> {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (!response.ok) return '';
        const data = await response.json();
        return data.ip ?? '';
    } catch {
        return '';
    }
}

export async function collectDeviceInfo(): Promise<DeviceInfo> {
    const parser = new UAParser(navigator.userAgent) as any;
    const result = parser.getResult();

    let deviceType = DeviceType.Desktop;
    if (result.device.type === 'mobile') deviceType = DeviceType.Mobile;
    else if (result.device.type === 'tablet') deviceType = DeviceType.Tablet;

    const ip = await getIPAddress();

    return {
        deviceType,
        userAgent: navigator.userAgent,
        operatingSystem: `${result.os.name} ${result.os.version}`,
        browser: `${result.browser.name} ${result.browser.version}`,
        lastIPAddress: ip,
    };
}
