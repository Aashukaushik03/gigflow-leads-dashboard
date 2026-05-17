import React from 'react';
import { Users } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
    <div className="w-16 h-16 bg-surface-100 dark:bg-surface-700 rounded-2xl flex items-center justify-center mb-4">
      {icon || <Users size={28} className="text-surface-400" />}
    </div>
    <h3 className="text-lg font-semibold text-surface-700 dark:text-surface-300 font-display mb-2">
      {title}
    </h3>
    <p className="text-sm text-surface-500 dark:text-surface-400 max-w-sm mb-6">
      {description}
    </p>
    {action}
  </div>
);

export default EmptyState;
