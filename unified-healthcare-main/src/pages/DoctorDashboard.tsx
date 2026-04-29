import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  Search, 
  Filter, 
  ChevronRight, 
  Activity, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  MoreVertical,
  Clock
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface PatientRecord {
  id: string;
  userId: string;
  name: string;
  age: number;
  glucose: number;
  bloodPressure: number;
  bmi: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  riskScore: number;
  createdAt: any;
}

export default function DoctorDashboard() {
  const { t } = useTranslation();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'All' | 'Low' | 'Medium' | 'High'>('All');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'patients'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PatientRecord[];
      setPatients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'All' || p.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200">
        <div>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Doctor Intelligence Portal</span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Patient Population Intelligence</h1>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-all">
             Global Filter
           </button>
           <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-sm">
             Alert Priority
           </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monitored Patients</span>
            <Users className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold mt-1">{patients.length}</div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[10px] text-emerald-600 font-bold">+12.5%</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">vs last month</span>
          </div>
        </div>

        <div className="bg-rose-600 text-white border border-rose-500 rounded-xl p-4 flex flex-col justify-between shadow-lg shadow-rose-200">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-rose-100 uppercase tracking-widest">Immediate Attention</span>
            <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div className="text-2xl font-bold mt-1">
            {patients.filter(p => p.riskLevel === 'High').length}
          </div>
          <div className="mt-4 text-[10px] font-bold uppercase tracking-widest bg-white/20 py-1 rounded text-center">
             Action Required
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sync Efficiency</span>
            <Activity className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold mt-1">99.2%</div>
          <div className="mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
             <div className="w-[99%] h-full bg-blue-500"></div>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Consultations</div>
          <div className="text-2xl font-bold mt-1">18</div>
          <div className="mt-4 text-[10px] font-bold text-blue-400 uppercase tracking-widest underline cursor-pointer">
             Jump to Queue
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
             <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.15em] flex items-center gap-2">
                <div className="w-1.5 h-3.5 bg-blue-600 rounded-full"></div>
                High Risk Population Log
             </h3>
             <div className="h-4 w-px bg-slate-200"></div>
             <div className="flex gap-2">
                {['All', 'High', 'Medium', 'Low'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setRiskFilter(f as any)}
                    className={cn(
                      "px-3 py-1 rounded text-[9px] font-black uppercase tracking-tighter transition-all",
                      riskFilter === f ? "bg-slate-900 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {f}
                  </button>
                ))}
             </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold outline-none focus:border-blue-400 w-40"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b">
              <tr>
                <th className="px-5 py-2.5">Patient / ID</th>
                <th className="px-5 py-2.5">Metrics Vector</th>
                <th className="px-5 py-2.5 text-center">AI Pred Score</th>
                <th className="px-5 py-2.5">Classification</th>
                <th className="px-5 py-2.5 text-right">System Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">Scanning population...</td></tr>
              ) : filteredPatients.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">No matching risk patterns found.</td></tr>
              ) : (
                filteredPatients.map((p) => (
                  <tr key={p.id} className={cn("hover:bg-slate-50/50 transition-colors", p.riskLevel === 'High' ? "bg-red-50/30" : "")}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${p.name}&background=random`} 
                          className="w-8 h-8 rounded-lg"
                          alt="avatar"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-900 tracking-tight">{p.name}</span>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">UH-AID-{p.id.slice(-4)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                       <div className="flex gap-4 text-xs font-mono">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">GLU</span>
                            <span className={cn("font-bold", p.glucose > 140 ? "text-rose-600" : "text-slate-900")}>{p.glucose}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">BMI</span>
                            <span className="font-bold text-slate-900">{p.bmi}</span>
                          </div>
                        </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="inline-block p-1 rounded-md bg-slate-50 border border-slate-100">
                        <span className={cn(
                          "text-xs font-mono font-black",
                          p.riskLevel === 'High' ? "text-rose-600" :
                          p.riskLevel === 'Medium' ? "text-amber-600" :
                          "text-emerald-600"
                        )}>
                          {(p.riskScore * 100).toFixed(0)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                        p.riskLevel === 'High' ? "bg-rose-50 text-rose-700 border-rose-200" :
                        p.riskLevel === 'Medium' ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-emerald-50 text-emerald-700 border-emerald-200"
                      )}>
                        {p.riskLevel}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button className="px-3 py-1 bg-slate-900 text-white rounded text-[9px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm">
                        Analyze EMR
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
