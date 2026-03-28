import type { TFunction } from 'i18next';
import { users } from '../data/users';

export function displayNameForUserId(userId: string, t: TFunction): string {
  const u = users.find((x) => x.id === userId);
  return u ? `${u.firstName} ${u.lastName}` : t('admin.guestUser');
}
