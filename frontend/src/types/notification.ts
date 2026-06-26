export type NotificationType =
  | 'provider_pending'
  | 'new_request'
  | 'quote_received'
  | 'quote_accepted'
  | 'order_created'
  | 'order_action'
  | 'order_completed'
  | 'payment'
  | 'dispute'
  | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  date?: string;
  href?: string;
  priority: 'low' | 'medium' | 'high';
}
