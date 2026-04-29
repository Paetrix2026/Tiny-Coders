import { motion, AnimatePresence } from 'motion/react';
import { X, User, Droplets, AlertTriangle, Phone, ExternalLink } from 'lucide-react';
import type { Patient } from '../../types';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { format, parseISO } from 'date-fns';

interface PatientDrawerProps {
  patient: Patient | null;
  onClose: () => void;
}

export default function PatientDrawer({ patient, onClose }: PatientDrawerProps) {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {patient && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40"
          />
          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Patient Summary</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {patient.profile?.full_name ?? 'Unknown'}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-slate-200 hover:bg-slate-300 transition-colors flex items-center justify-center"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Avatar + basic info */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center">
                  <User className="w-7 h-7 text-blue-500" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{patient.profile?.full_name}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                    {patient.profile?.email}
                  </div>
                  {patient.date_of_birth && (
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      DOB: {format(parseISO(patient.date_of_birth), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>
              </div>

              {/* Blood type */}
              {patient.blood_type && (
                <div className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-100 rounded-lg">
                  <Droplets className="w-4 h-4 text-rose-500 shrink-0" />
                  <div>
                    <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest block">Blood Type</span>
                    <span className="text-sm font-black text-rose-700">{patient.blood_type}</span>
                  </div>
                </div>
              )}

              {/* Allergies */}
              {patient.allergies && patient.allergies.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Allergies</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.allergies.map(a => (
                      <span key={a} className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Emergency contact */}
              {patient.emergency_contact && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Emergency Contact</span>
                    <span className="text-xs font-bold text-slate-700">{patient.emergency_contact}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100">
              <button
                onClick={() => { navigate(`/patients/${patient.id}/records`); onClose(); }}
                className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
              >
                <ExternalLink className="w-4 h-4" /> View Full Record History
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
