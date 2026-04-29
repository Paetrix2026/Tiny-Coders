import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Plus, 
  History, 
  BrainCircuit, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileText,
  Stethoscope,
  ShieldCheck
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { cn } from '../lib/utils';

interface HealthRecord {
  id: string;
  age: number;
  glucose: number;
  bloodPressure: number;
  bmi: number;
  insulin: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  riskScore: number;
  createdAt: string;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [predicting, setPredicting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    age: '',
    glucose: '',
    bloodPressure: '',
    bmi: '',
    insulin: ''
  });

  const [lastPrediction, setLastPrediction] = useState<any>(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'patients'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate().toLocaleString()
      })) as HealthRecord[];
      setRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setPredicting(true);
    try {
      const response = await fetch('/api/predict-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: Number(formData.age),
          glucose: Number(formData.glucose),
          bp: Number(formData.bloodPressure),
          bmi: Number(formData.bmi),
          insulin: Number(formData.insulin)
        })
      });
      const prediction = await response.json();
      setLastPrediction(prediction);

      // Save to Firebase
      if (auth.currentUser) {
        await addDoc(collection(db, 'patients'), {
          userId: auth.currentUser.uid,
          name: auth.currentUser.displayName || 'Patient',
          age: Number(formData.age),
          glucose: Number(formData.glucose),
          bloodPressure: Number(formData.bloodPressure),
          bmi: Number(formData.bmi),
          insulin: Number(formData.insulin),
          riskLevel: prediction.risk,
          riskScore: prediction.score,
          createdAt: Timestamp.now()
        });
        fetchRecords();
        setFormData({ age: '', glucose: '', bloodPressure: '', bmi: '', insulin: '' });
        setShowAddForm(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{t('dashboard')}</span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">{t('welcome')}</h1>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="px-5 py-2 bg-slate-900 text-white rounded-lg text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm hover:bg-slate-800 transition-all"
        >
          <Plus className="w-4 h-4" /> {t('add_patient')}
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        {/* Dashboard Summary Cards */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Records</span>
            <Activity className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold mt-1">{records.length}</div>
          <div className="mt-4 h-1 bg-slate-100 rounded-full">
            <div className="w-1/2 h-full bg-blue-500 rounded-full"></div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">High Risk Alerts</span>
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="text-2xl font-bold mt-1">
            {records.filter(r => r.riskLevel === 'High').length}
          </div>
          <div className="mt-4 flex gap-2 items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Requires Sync</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Latest Status</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold mt-1">Stable</div>
          <div className="mt-4 text-[10px] text-slate-500 uppercase font-bold">
            Last: <span className="text-slate-800">Checked {records.length > 0 ? 'Today' : 'N/A'}</span>
          </div>
        </div>

        <div className="bg-blue-600 text-white rounded-xl p-4 flex flex-col justify-between shadow-lg shadow-blue-200">
          <div className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Intelligence Layer</div>
          <div className="text-lg font-bold mt-1 leading-tight">AI Engine v4.2</div>
          <button className="mt-4 w-full bg-white/20 hover:bg-white/30 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-colors">
            System Optimized
          </button>
        </div>

        {/* History Table Layout */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b flex justify-between items-center bg-slate-50/50">
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.15em] flex items-center gap-2">
                <div className="w-1.5 h-3.5 bg-blue-600 rounded-full"></div>
                Patient Intelligence Logs
              </h3>
              <button className="text-[10px] font-bold text-blue-600 uppercase">Export View</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b">
                  <tr>
                    <th className="px-5 py-2.5">Date / ID</th>
                    <th className="px-5 py-2.5">Metrics (GL / BP / BMI)</th>
                    <th className="px-5 py-2.5 text-center">Risk Index</th>
                    <th className="px-5 py-2.5">Classification</th>
                    <th className="px-5 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={5} className="p-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">Querying database...</td></tr>
                  ) : records.length === 0 ? (
                    <tr><td colSpan={5} className="p-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No intelligence logs found.</td></tr>
                  ) : (
                    records.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800 tracking-tight">{record.createdAt.split(',')[0]}</span>
                            <span className="text-[10px] font-mono text-slate-400 uppercase">LOG-#{record.id.slice(-4)}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex gap-4 text-xs font-mono">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">GLU</span>
                              <span className="font-bold text-slate-900">{record.glucose}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">BP</span>
                              <span className="font-bold text-slate-900">{record.bloodPressure}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">BMI</span>
                              <span className="font-bold text-slate-900">{record.bmi}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={cn(
                            "text-xs font-mono font-bold",
                            record.riskLevel === 'High' ? "text-rose-600" :
                            record.riskLevel === 'Medium' ? "text-amber-600" :
                            "text-emerald-600"
                          )}>
                            {(record.riskScore * 100).toFixed(0)}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                            record.riskLevel === 'High' ? "bg-rose-100 text-rose-700" :
                            record.riskLevel === 'Medium' ? "bg-amber-100 text-amber-700" :
                            "bg-emerald-100 text-emerald-700"
                          )}>
                            {record.riskLevel}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button className="text-blue-500 hover:underline text-[10px] font-bold uppercase tracking-widest">Detail</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: AI Assessment Result */}
        <div className="lg:col-span-1 space-y-4">
          <AnimatePresence>
            {lastPrediction && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "p-5 rounded-xl text-white shadow-xl relative overflow-hidden flex flex-col",
                  lastPrediction.risk === 'High' ? "bg-rose-600" :
                  lastPrediction.risk === 'Medium' ? "bg-amber-500" :
                  "bg-emerald-600"
                )}
              >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <BrainCircuit className="w-24 h-24" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 opacity-80">Intelligence Output</h3>
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                  <div className="w-16 h-16 rounded-full border-4 border-white/30 flex items-center justify-center mb-3">
                    <span className="text-xl font-black">{(lastPrediction.score * 100).toFixed(0)}</span>
                  </div>
                  <div className="text-xl font-black uppercase tracking-tight mb-1">{lastPrediction.risk} Risk</div>
                  <p className="text-[10px] font-medium opacity-80 max-w-[180px] leading-relaxed italic">
                    {lastPrediction.recommendation}
                  </p>
                </div>
                <button 
                  onClick={() => setLastPrediction(null)}
                  className="mt-6 w-full py-2 bg-white text-slate-900 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Confirm Assessment
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-slate-900 text-white rounded-xl p-5 relative overflow-hidden shadow-sm">
            <div className="absolute bottom-0 right-0 p-4 opacity-5">
              <Stethoscope className="w-24 h-24" />
            </div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" /> Security Status
            </h3>
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center text-[10px] border-b border-slate-800 pb-2.5">
                <span className="text-slate-500 font-bold uppercase">Data Health</span>
                <span className="font-bold text-emerald-400 uppercase">Synchronized</span>
              </div>
              <div className="flex justify-between items-center text-[10px] border-b border-slate-800 pb-2.5">
                <span className="text-slate-500 font-bold uppercase">Encryption</span>
                <span className="font-bold text-blue-400 uppercase">AES-256 Enabled</span>
              </div>
              <div className="flex justify-between items-center text-[10px] border-b border-slate-800 pb-2.5">
                <span className="text-slate-500 font-bold uppercase">AI Node</span>
                <span className="font-bold">v4.2 Rule Discovery</span>
              </div>
            </div>
            <p className="text-[9px] text-slate-600 mt-6 font-medium uppercase tracking-tight">
              Clinical decision support tool only. Not a diagnostic substitute.
            </p>
          </div>
        </div>
      </div>

      {/* Add Record Modal - High Density style */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-slate-900/40 backdrop-blur-[2px]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                   <Plus className="w-3.5 h-3.5 text-blue-600" /> {t('add_patient')}
                </h2>
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                >✕</button>
              </div>
              <div className="p-6">
                <form onSubmit={handlePredict} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1">{t('age')}</label>
                      <input
                        type="number"
                        placeholder="Age"
                        required
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold outline-none focus:border-blue-400 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1">{t('glucose')}</label>
                      <input
                        type="number"
                        placeholder="GLU"
                        required
                        value={formData.glucose}
                        onChange={(e) => setFormData({...formData, glucose: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold outline-none focus:border-blue-400 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1">{t('blood_pressure')}</label>
                      <input
                        type="number"
                        placeholder="BP"
                        required
                        value={formData.bloodPressure}
                        onChange={(e) => setFormData({...formData, bloodPressure: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold outline-none focus:border-blue-400 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1">{t('bmi')}</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="BMI"
                        required
                        value={formData.bmi}
                        onChange={(e) => setFormData({...formData, bmi: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold outline-none focus:border-blue-400 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1">{t('insulin')}</label>
                    <input
                      type="number"
                      placeholder="mu U/ml"
                      required
                      value={formData.insulin}
                      onChange={(e) => setFormData({...formData, insulin: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold outline-none focus:border-blue-400 transition-all"
                    />
                  </div>

                  <button
                    disabled={predicting}
                    className="w-full py-3 bg-slate-900 text-white rounded font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50 mt-4"
                  >
                    {predicting ? 'Computing Risk Vectors...' : 'Start AI Assessment Engine'}
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
