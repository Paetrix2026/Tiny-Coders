import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Stethoscope, Activity, ShieldCheck, Video, ArrowRight } from 'lucide-react';

export default function Landing() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-sm uppercase tracking-widest text-slate-900">{t('app_name')}</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all"
          >
            {t('login')}
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-1.5 bg-blue-600 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-sm transition-all"
          >
            Deploy Portal
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded border border-blue-100 text-[9px] font-black uppercase tracking-[0.2em] mb-6">
            <Activity className="w-3 h-3" />
            Infrastructure for modern healthcare
          </div>
          <h1 className="text-5xl font-bold text-slate-900 leading-[1.1] mb-6 tracking-tight">
            The Intelligence Layer <br/>
            <span className="text-blue-600">for Clinical Precision.</span>
          </h1>
          <p className="text-sm text-slate-500 mb-8 max-w-md leading-relaxed font-medium">
            Unified patient profiling, deep-link risk analysis, and encrypted telehealth protocols. Engineered for the next generation of medical practitioners.
          </p>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-slate-900 text-white rounded font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
            >
              Initialize System <ArrowRight className="w-4 h-4" />
            </button>
            <button className="px-6 py-3 border border-slate-200 text-slate-600 rounded font-bold text-[11px] uppercase tracking-widest hover:bg-white transition-all">
              Technical Overview
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <Stethoscope className="w-64 h-64 text-blue-200" />
          </div>
          
          <div className="relative bg-white rounded-xl p-4 border border-slate-200 shadow-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <ShieldCheck className="w-6 h-6 text-blue-600 mb-3" />
                <h3 className="text-[11px] font-black uppercase tracking-widest mb-1 text-slate-800">Security Core</h3>
                <p className="text-[10px] text-slate-500 font-medium">AES-256 encrypted emr protocol management.</p>
              </div>
              <div className="bg-slate-900 p-4 rounded-lg text-white">
                <Activity className="w-6 h-6 text-rose-500 mb-3" />
                <h3 className="text-[11px] font-black uppercase tracking-widest mb-1">Predicitive AI</h3>
                <p className="text-[10px] text-slate-400 font-medium">Deterministic risk modeling via multi-vector analysis.</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <Video className="w-6 h-6 text-blue-500 mb-3" />
                <h3 className="text-[11px] font-black uppercase tracking-widest mb-1">Tele-Protocol</h3>
                <p className="text-[10px] text-slate-500 font-medium">Low-latency clinical video clustering.</p>
              </div>
              <div className="bg-blue-600 p-4 rounded-lg shadow-lg shadow-blue-200 text-white">
                <h3 className="text-xl font-bold mb-1">10k+</h3>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Doctors Integrated</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200 mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Prediction Accuracy', val: '99.4%' },
            { label: 'Active Clusters', val: '24/7' },
            { label: 'Specialist Nodes', val: '500+' },
            { label: 'Security Compliance', val: 'HIPAA/ISO' }
          ].map(s => (
            <div key={s.label} className="flex flex-col gap-1">
              <div className="text-xl font-black text-slate-900">{s.val}</div>
              <div className="text-[9px] text-slate-400 font-black uppercase tracking-[0.15em]">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
