import { Calendar } from 'lucide-react';

export default function Appointments() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white border border-slate-200 rounded-xl">
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
        <Calendar className="w-8 h-8 text-blue-500" />
      </div>
      <h1 className="text-xl font-bold text-slate-900">Appointments Module Disabled</h1>
      <p className="text-sm text-slate-500 mt-2 max-w-md text-center">
        The scheduling module has been temporarily disabled during the V2 database migration.
        Please contact your administrator to schedule an appointment.
      </p>
    </div>
  );
}
