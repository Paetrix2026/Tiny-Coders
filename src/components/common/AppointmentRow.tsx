import type { Appointment } from '../../types';
import { Video, MapPin, Clock, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '../../lib/utils';

interface AppointmentRowProps {
  appointment: Appointment;
  viewAs: 'patient' | 'doctor';
  onAction?: (id: string) => void;
  actionLabel?: string;
}

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
};

export default function AppointmentRow({ appointment, viewAs, onAction, actionLabel = 'View' }: AppointmentRowProps) {
  const isVideo = appointment.type === 'telehealth';
  const displayName = viewAs === 'patient'
    ? `Dr. ${appointment.doctor?.full_name ?? 'Unknown'}`
    : appointment.patient?.profile?.full_name ?? 'Unknown Patient';

  return (
    <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-4">
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center border shrink-0',
          isVideo ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
        )}>
          {isVideo ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
        </div>
        <div>
          <div className="text-xs font-bold text-slate-900">{displayName}</div>
          <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <Clock className="w-3 h-3" />
            {format(parseISO(appointment.scheduled_at), 'MMM d, yyyy · h:mm a')}
            <span className="text-slate-300">·</span>
            {appointment.type}
          </div>
          {appointment.notes && (
            <div className="text-[10px] text-slate-500 mt-0.5 max-w-xs truncate">{appointment.notes}</div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={cn(
          'px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border',
          statusStyles[appointment.status] ?? ''
        )}>
          {appointment.status}
        </span>
        {onAction && (
          <button
            onClick={() => onAction(appointment.id)}
            className="text-blue-500 hover:text-blue-700 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
