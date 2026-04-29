import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Activity, ShieldAlert, CheckCircle, Info, Loader2, Save } from 'lucide-react';

export default function RiskPredictor() {
  const [hba1c, setHba1c] = useState('');
  const [fbs, setFbs] = useState('');
  const [bmi, setBmi] = useState('');
  const [cholesterol, setCholesterol] = useState('');
  const [age, setAge] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const fetchPatientData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: patient } = await supabase
          .from('patients')
          .select('bmi, age')
          .eq('patient_id', user.id)
          .single();
        if (patient) {
          setBmi(String(patient.bmi || ''));
          setAge(String(patient.age || ''));
        }
      }
    };
    fetchPatientData();
  }, []);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          hba1c: Number(hba1c), 
          fbs: Number(fbs), 
          bmi: Number(bmi), 
          cholesterol: Number(cholesterol), 
          age: Number(age) 
        })
      });

      if (!response.ok) throw new Error('Prediction service is currently offline');
      
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError('Prediction service is offline — please try again later');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: saveError } = await supabase
        .from('records')
        .insert({
          patient_id: user.id,
          glucose: Number(fbs),
          bp: String(result.risk)
        });

      if (saveError) throw saveError;
      alert('Result saved to your medical history.');
    } catch (err) {
      console.error(err);
      alert('Failed to save result.');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" /> ML Risk Predictor
        </h1>
        <p className="text-slate-500 mt-1">Enter your clinical data to assess potential health risks using our AI engine.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
          <form onSubmit={handlePredict} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">HbA1c Level (%)</label>
              <input
                type="number"
                step="0.1"
                required
                value={hba1c}
                onChange={(e) => setHba1c(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. 5.7"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Fasting Blood Sugar (mg/dL)</label>
              <input
                type="number"
                required
                value={fbs}
                onChange={(e) => setFbs(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. 99"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">BMI (kg/m²)</label>
              <input
                type="number"
                step="0.1"
                required
                value={bmi}
                onChange={(e) => setBmi(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. 24.5"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Cholesterol (mg/dL)</label>
              <input
                type="number"
                required
                value={cholesterol}
                onChange={(e) => setCholesterol(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. 180"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Age (years)</label>
              <input
                type="number"
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. 45"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</>
              ) : (
                'Run Risk Analysis'
              )}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-red-700 flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-bold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className={`p-8 rounded-xl border shadow-sm transition-all animate-in fade-in slide-in-from-bottom-4 duration-500 ${
              result.risk === 'high' ? 'bg-red-50 border-red-200 text-red-900' :
              result.risk === 'medium' ? 'bg-amber-50 border-amber-200 text-amber-900' :
              'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                {result.risk === 'high' ? <ShieldAlert className="w-8 h-8" /> : 
                 result.risk === 'medium' ? <Info className="w-8 h-8 text-amber-600" /> : 
                 <CheckCircle className="w-8 h-8" />}
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  {result.risk === 'high' ? 'High Risk Detected' : 
                   result.risk === 'medium' ? 'Moderate Risk' : 
                   'Low Risk'}
                </h2>
              </div>
              
              <p className="text-lg mb-6 leading-relaxed">
                {result.risk === 'high' ? 'We recommend you consult with a specialist as soon as possible for a full screening.' : 
                 result.risk === 'medium' ? 'Consider lifestyle changes, improved diet, and regular exercise to lower your risk profile.' : 
                 'Excellent work! Your clinical indicators are within a healthy range. Maintain your current lifestyle.'}
              </p>

              {result.confidence && (
                <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg mb-6 border border-current/10">
                  <span className="font-bold text-sm uppercase opacity-60">AI Confidence</span>
                  <span className="text-xl font-black">{Math.round(result.confidence * 100)}%</span>
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={saveLoading}
                className="w-full bg-white border border-slate-200 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
              >
                {saveLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Result to History
              </button>
            </div>
          )}

          {!result && !error && !loading && (
            <div className="bg-slate-50 border border-slate-200 border-dashed p-12 rounded-xl text-center text-slate-400">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium">Complete the form to see your analysis results here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
