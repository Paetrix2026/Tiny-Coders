import type { RecordEntry } from '../../types';
import { Droplets, Heart, User } from 'lucide-react';

interface RecordCardProps {
  record: RecordEntry;
}

export default function RecordCard({ record }: RecordCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
            Record ID: {record.id.substring(0, 8)}
          </span>
          <h3 className="text-sm font-bold text-slate-900 mt-0.5">Health Entry</h3>
        </div>
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
          <ActivityIcon className="w-4 h-4 text-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
        <div className="flex items-start gap-2">
          <Droplets className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Glucose</span>
            <span className="text-xs text-slate-700 font-bold">{record.glucose} mg/dL</span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Heart className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
          <div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Blood Pressure</span>
            <span className="text-xs text-slate-700 font-bold">{record.bp}</span>
          </div>
        </div>
      </div>

      {record.doctor?.profile && (
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Dr. {record.doctor.profile.name}
          </span>
        </div>
      )}
    </div>
  );
}

function ActivityIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
