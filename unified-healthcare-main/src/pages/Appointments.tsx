import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Video, 
  CheckCircle2, 
  Plus, 
  MoreVertical,
  ChevronRight,
  Stethoscope,
  X
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, Timestamp, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Appointment {
  id: string;
  patientId: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
  type: 'video' | 'offline';
}

export default function Appointments() {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newAppt, setNewAppt] = useState({
    doctor: 'Dr. Sarah Chen',
    date: '',
    time: '',
    type: 'video' as 'video' | 'offline',
    notes: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'appointments'),
        where('patientId', '==', auth.currentUser.uid),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Appointment[];
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, 'appointments'), {
        patientId: auth.currentUser.uid,
        doctorName: newAppt.doctor,
        date: newAppt.date,
        time: newAppt.time,
        status: 'scheduled',
        type: newAppt.type,
        notes: newAppt.notes,
        createdAt: Timestamp.now()
      });
      setShowModal(false);
      fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Scheduling Intelligence</span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Telehealth & Clinical Sessions</h1>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-5 py-2 bg-slate-900 text-white rounded-lg text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm hover:bg-slate-800 transition-all"
        >
          <Plus className="w-4 h-4" /> Schedule Visit
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upcoming Visits</span>
            <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold mt-1">{appointments.length}</div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Next: {appointments[0]?.date || 'None'}</span>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b flex justify-between items-center bg-slate-50/50">
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.15em] flex items-center gap-2">
                <div className="w-1.5 h-3.5 bg-blue-600 rounded-full"></div>
                Active Scheduling Queue
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">Accessing schedule...</div>
              ) : appointments.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No clinical visits logged.</div>
              ) : (
                appointments.map((apt) => (
                  <div key={apt.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center border",
                        apt.type === 'video' ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"
                      )}>
                        {apt.type === 'video' ? <Video className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 tracking-tight">Consult with {apt.doctorName}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                          <Clock className="w-3 h-3" /> {apt.date} @ {apt.time}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border shadow-sm",
                        apt.status === 'scheduled' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                      )}>
                        {apt.status}
                      </span>
                      <button className="text-blue-500 hover:scale-105 transition-transform">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-slate-900/40 backdrop-blur-[2px]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">Schedule New Intelligence Session</h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >✕</button>
              </div>
              <div className="p-6">
                <form onSubmit={handleBook} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1">Doctor Reference</label>
                    <select
                      required
                      value={newAppt.doctor}
                      onChange={e => setNewAppt({...newAppt, doctor: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold outline-none focus:border-blue-400 appearance-none"
                    >
                      <option>Dr. Sarah Chen</option>
                      <option>Dr. James Wilson</option>
                      <option>Dr. Anita Rao</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1">Visit Type</label>
                      <select
                        value={newAppt.type}
                        onChange={e => setNewAppt({...newAppt, type: e.target.value as any})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold outline-none focus:border-blue-400"
                      >
                        <option value="video">Telehealth (Encrypted)</option>
                        <option value="offline">In-person (Clinic)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1">Session Date</label>
                      <input
                        type="date"
                        required
                        value={newAppt.date}
                        onChange={e => setNewAppt({...newAppt, date: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1">Timeline Window</label>
                    <input
                      type="time"
                      required
                      value={newAppt.time}
                      onChange={e => setNewAppt({...newAppt, time: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold outline-none focus:border-blue-400"
                    />
                  </div>
                  <button
                    className="w-full py-3 bg-slate-900 text-white rounded font-bold text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95 mt-4"
                  >
                    Confirm Booking
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
