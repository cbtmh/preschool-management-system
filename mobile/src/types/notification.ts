export enum NotificationType {
  ALL = 'ALL',
  CLASS = 'CLASS',
  INDIVIDUAL = 'INDIVIDUAL'
}

export interface Notification {
  id: number;
  recipientId: number;
  notificationId: number;
  title: string;
  content: string;
  type: NotificationType;
  senderName: string;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
  referenceType?: string;
  referenceId?: number;
}

export interface NotificationResponse {
  content: Notification[];
  pageable: any;
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
