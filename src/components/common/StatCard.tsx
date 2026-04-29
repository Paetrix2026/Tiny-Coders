import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'blue' | 'emerald' | 'rose' | 'amber' | 'slate';
  trend?: { value: string; up: boolean };
  subtext?: string;
}

const colorMap = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-100', icon: 'text-blue-500', badge: 'bg-blue-600' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'text-emerald-500', badge: 'bg-emerald-600' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-100', icon: 'text-rose-500', badge: 'bg-rose-600' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'text-amber-500', badge: 'bg-amber-600' },
  slate: { bg: 'bg-slate-900', border: 'border-slate-800', icon: 'text-blue-400', badge: 'bg-slate-700' },
};

export default function StatCard({ label, value, icon: Icon, color = 'blue', trend, subtext }: StatCardProps) {
  const c = colorMap[color];
  const isDark = color === 'slate';

  return (
    <div className={cn(
      'rounded-xl p-4 border flex flex-col justify-between shadow-sm',
      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
    )}>
      <div className="flex justify-between items-start">
        <span className={cn(
          'text-[10px] font-bold uppercase tracking-wider',
          isDark ? 'text-slate-400' : 'text-slate-400'
        )}>{label}</span>
        <Icon className={cn('w-3.5 h-3.5', isDark ? c.icon : c.icon)} />
      </div>
      <div className={cn('text-2xl font-bold mt-1', isDark ? 'text-white' : 'text-slate-900')}>{value}</div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5">
          {trend.up
            ? <TrendingUp className="w-3 h-3 text-emerald-500" />
            : <TrendingDown className="w-3 h-3 text-rose-500" />}
          <span className={cn('text-[10px] font-bold', trend.up ? 'text-emerald-600' : 'text-rose-600')}>
            {trend.value}
          </span>
        </div>
      )}
      {subtext && !trend && (
        <div className={cn('mt-3 text-[10px] font-bold uppercase tracking-tight', isDark ? 'text-slate-500' : 'text-slate-400')}>
          {subtext}
        </div>
      )}
    </div>
  );
}
