import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  loading?: boolean;
  accentClass?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  loading = false,
  accentClass = 'text-blue-400',
}) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${accentClass} bg-white/10`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-white/60 text-sm font-medium">{label}</p>
          {loading ? (
            <div className="mt-2 h-8 bg-white/10 rounded-lg animate-pulse" />
          ) : (
            <p className="text-white font-bold text-2xl mt-1">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
};
