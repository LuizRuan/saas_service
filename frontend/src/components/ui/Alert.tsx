import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertProps {
  type: 'error' | 'success' | 'warning' | 'info';
  message: string;
  className?: string;
}

const config = {
  error: {
    icon: AlertCircle,
    classes: 'bg-red-50 border-red-300 text-red-800',
    iconClass: 'text-danger',
  },
  success: {
    icon: CheckCircle2,
    classes: 'bg-green-50 border-green-300 text-green-800',
    iconClass: 'text-success',
  },
  warning: {
    icon: TriangleAlert,
    classes: 'bg-orange-50 border-orange-300 text-orange-800',
    iconClass: 'text-warning',
  },
  info: {
    icon: Info,
    classes: 'bg-blue-50 border-blue-300 text-blue-800',
    iconClass: 'text-blue-600',
  },
};

export function Alert({ type, message, className }: AlertProps) {
  const { icon: Icon, classes, iconClass } = config[type];
  return (
    <div className={cn('flex items-start gap-3 rounded-lg border px-4 py-3 text-sm', classes, className)}>
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', iconClass)} />
      <span>{message}</span>
    </div>
  );
}
