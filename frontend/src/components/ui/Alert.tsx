import { ReactNode } from 'react';
import { clsx } from 'clsx';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}

const config: Record<AlertVariant, { style: string; Icon: typeof Info }> = {
  info: { style: 'bg-blue-50 border-blue-200 text-blue-800', Icon: Info },
  success: { style: 'bg-trust-50 border-trust-100 text-trust-800', Icon: CheckCircle },
  warning: { style: 'bg-yellow-50 border-yellow-200 text-yellow-800', Icon: AlertCircle },
  error: { style: 'bg-red-50 border-red-200 text-red-800', Icon: XCircle },
};

export default function Alert({ variant = 'info', title, children, className }: AlertProps) {
  const { style, Icon } = config[variant];
  return (
    <div className={clsx('flex gap-3 p-4 rounded-xl border', style, className)}>
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 text-sm">
        {title && <p className="font-semibold mb-1">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}
