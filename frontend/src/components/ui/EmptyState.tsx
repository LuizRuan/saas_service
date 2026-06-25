import { motion } from 'framer-motion';
import { type ElementType } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';

interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface EmptyStateProps {
  icon: ElementType;
  title: string;
  description?: string;
  action?: EmptyStateAction;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100">
        <Icon className="h-9 w-9 text-slate-300" />
      </div>
      <h3 className="text-base font-semibold text-slate-700 mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      )}
      {action && (
        action.href ? (
          <Link to={action.href}>
            <Button size="sm">{action.label}</Button>
          </Link>
        ) : (
          <Button size="sm" onClick={action.onClick}>{action.label}</Button>
        )
      )}
    </motion.div>
  );
}
