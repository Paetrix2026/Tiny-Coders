import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Vitals } from '../../types';
import { format, parseISO } from 'date-fns';

interface VitalsChartProps {
  vitals: Vitals[];
  mode?: 'heart_rate' | 'both';
}

export default function VitalsChart({ vitals, mode = 'heart_rate' }: VitalsChartProps) {
  if (!vitals.length) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">
        No vitals data recorded yet
      </div>
    );
  }

  const data = [...vitals]
    .reverse()
    .map(v => ({
      date: format(parseISO(v.recorded_at), 'MMM d'),
      heart_rate: v.heart_rate ?? null,
      bp_sys: v.blood_pressure ? parseInt(v.blood_pressure.split('/')[0]) : null,
    }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="date" tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ fontSize: 11, fontWeight: 700, border: '1px solid #e2e8f0', borderRadius: 8 }}
          labelStyle={{ color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}
        />
        <Line
          type="monotone"
          dataKey="heart_rate"
          name="Heart Rate (bpm)"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 3, fill: '#3b82f6' }}
          activeDot={{ r: 5 }}
          connectNulls
        />
        {mode === 'both' && (
          <Line
            type="monotone"
            dataKey="bp_sys"
            name="Systolic BP (mmHg)"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 3, fill: '#10b981' }}
            activeDot={{ r: 5 }}
            connectNulls
          />
        )}
        {mode === 'both' && <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />}
      </LineChart>
    </ResponsiveContainer>
  );
}
