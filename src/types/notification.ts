import type { FC } from 'react';
import {
    IconCalendarCheck, IconCalendarOff, IconCalendarX, IconCalendarEvent, IconCalendarDot,
    IconSpeakerphone, IconMessage, IconCalendarPlus, IconMailPlus, IconMailOff,
    IconMailForward, IconCarGarage, IconCarOff, IconStar, IconPencil,
    IconUserEdit, IconUserPlus, IconSquarePlus, IconTrash, IconRefresh,
} from '@tabler/icons-react';

export enum UserNotificationType {
    BookingConfirmed = 1,
    BookingCancelled = 2,
    BookingRejected = 3,
    BookingReminder = 4,
    BookingCompleted = 5,
    NewPromotion = 6,
    NewMessage = 7,
    NewBookingRequest = 8,
    NewSubscribe = 9,
    Unsubscribe = 10,
    NewContactMessage = 11,
    NewCar = 12,
    CarUpdated = 13,
    NewReview = 14,
    EntityUpdated = 15,
    ProfileUpdated = 16,
    UserRegistered = 17,
    EntityAdded = 18,
    CarDeleted = 19,
    EntityDeleted = 20,
}

export interface UserNotificationDto {
    id: string;
    createdOn: string;
    modifiedOn: string | null;
    user: { id: string; firstName: string; lastName: string } | null;
    message: string;
    isRead: boolean;
    userNotificationType: number;
}

export interface NotificationPagedResponse<T> {
    items: T[];
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

interface NotifTypeMeta {
    icon: FC<any>;
    color: string;
}

export const NOTIFICATION_TYPE_META: Record<number, NotifTypeMeta> = {
    [UserNotificationType.BookingConfirmed]:  { icon: IconCalendarCheck, color: 'teal' },
    [UserNotificationType.BookingCancelled]:  { icon: IconCalendarOff, color: 'red' },
    [UserNotificationType.BookingRejected]:   { icon: IconCalendarX, color: 'red' },
    [UserNotificationType.BookingReminder]:   { icon: IconCalendarEvent, color: 'orange' },
    [UserNotificationType.BookingCompleted]:  { icon: IconCalendarDot, color: 'green' },
    [UserNotificationType.NewPromotion]:      { icon: IconSpeakerphone, color: 'violet' },
    [UserNotificationType.NewMessage]:        { icon: IconMessage, color: 'blue' },
    [UserNotificationType.NewBookingRequest]: { icon: IconCalendarPlus, color: 'cyan' },
    [UserNotificationType.NewSubscribe]:      { icon: IconMailPlus, color: 'teal' },
    [UserNotificationType.Unsubscribe]:       { icon: IconMailOff, color: 'gray' },
    [UserNotificationType.NewContactMessage]: { icon: IconMailForward, color: 'indigo' },
    [UserNotificationType.NewCar]:            { icon: IconCarGarage, color: 'teal' },
    [UserNotificationType.CarUpdated]:        { icon: IconRefresh, color: 'blue' },
    [UserNotificationType.NewReview]:         { icon: IconStar, color: 'yellow' },
    [UserNotificationType.EntityUpdated]:     { icon: IconPencil, color: 'orange' },
    [UserNotificationType.ProfileUpdated]:    { icon: IconUserEdit, color: 'cyan' },
    [UserNotificationType.UserRegistered]:    { icon: IconUserPlus, color: 'green' },
    [UserNotificationType.EntityAdded]:       { icon: IconSquarePlus, color: 'teal' },
    [UserNotificationType.CarDeleted]:        { icon: IconCarOff, color: 'red' },
    [UserNotificationType.EntityDeleted]:     { icon: IconTrash, color: 'red' },
};
