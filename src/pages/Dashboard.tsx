import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { 
  LayoutDashboard, 
  Activity, 
  FileText, 
  MessageCircle, 
  LogOut, 
  ChevronRight, 
  Calendar, 
  Bell,
  Search,
  Plus,
  ArrowUpRight,
  User,
  History,
  Send,
  Loader2,
  AlertCircle,
  Download,
  MoreHorizontal
} from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);

  // Risk Predictor Form States
  const [hba1c, setHba1c] = useState('');
  const [fbs, setFbs] = useState('');
  const [bmiInput, setBmiInput] = useState('');
  const [cholesterol, setCholesterol] = useState('');
  const [ageInput, setAgeInput] = useState('');
  const [predictLoading, setPredictLoading] = useState(false);
  const [predictResult, setPredictResult] = useState<any>(null);
  const [predictError, setPredictError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  // Telehealth States
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [chatMessage, setChatMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, records]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      const { data: patientData } = await supabase.from('patients').select('*').eq('patient_id', user.id).single();
      const { data: recordData } = await supabase.from('records').select('*').eq('patient_id', user.id).order('id', { ascending: false });
      const { data: doctorData } = await supabase.from('doctors').select('*, profile:profiles(name)');

      setProfile(profileData);
      setPatient(patientData);
      setRecords(recordData || []);
      setDoctors(doctorData || []);

      if (patientData) {
        setFbs(String(patientData.glucose || ''));
        setBmiInput(String(patientData.bmi || ''));
        setAgeInput(String(patientData.age || ''));
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.replace('/login');
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple clicks
    if (predictLoading) return;

    setPredictLoading(true);
    setPredictError('');
    setPredictResult(null);

    try {
      // Robust number parsing
      const payload = {
        hba1c: parseFloat(hba1c) || 0,
        fbs: parseFloat(fbs) || 0,
        bmi: parseFloat(bmiInput) || 0,
        cholesterol: parseFloat(cholesterol) || 0,
        age: parseFloat(ageInput) || 0
      };

      const res = await fetch('https://twig-yapping-statute.ngrok-free.dev/predict', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from server');
      }

      setPredictResult(data);
    } catch (err: any) {
      console.error('Prediction Error:', err);
      setPredictError(err.message || 'The prediction service is currently unavailable. Please try again later.');
    } finally {
      setPredictLoading(false);
    }
  };

  const handleSaveResult = async () => {
    if (!predictResult) return;
    setSaveLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('records').insert({
        patient_id: user?.id,
        glucose: Number(fbs),
        bp: predictResult.status
      });
      fetchInitialData();
      alert('Result saved to records!');
    } catch (err) {
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !selectedDoctor) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('records').insert({
        patient_id: user?.id,
        doctor_id: selectedDoctor.user_id,
        glucose: 0,
        bp: 'MSG:' + chatMessage
      });
      setChatMessage('');
      fetchInitialData();
    } catch (err) {
      console.error(err);
    }
  };

  const downloadCSV = () => {
    const headers = ['Date', 'Glucose (mg/dL)', 'Risk Level', 'Doctor ID'];
    const rows = records.map(r => ['Recent', r.glucose, r.bp, r.doctor_id || 'N/A']);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `health-records-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
      <Loader2 className="w-5 h-5 text-[#0A0A0A] animate-spin" />
    </div>
  );

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, section: 'Main' },
    { id: 'risk', label: 'Risk Predictor', icon: Activity, section: 'Main' },
    { id: 'records', label: 'My Records', icon: FileText, section: 'Main', badge: records.length },
    { id: 'chat', label: 'Telehealth & Chat', icon: MessageCircle, section: 'Care' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF9] font-sans antialiased text-[#0A0A0A] flex">
      
      {/* Sidebar */}
      <aside className="w-[212px] bg-white border-r border-[#E5E5E4] flex flex-col fixed inset-y-0">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-6 h-6 bg-[#0A0A0A] rounded flex items-center justify-center text-white font-bold text-xs">U</div>
            <span className="text-sm font-bold tracking-tight">Unified Health</span>
          </div>

          <div className="space-y-6">
            {['Main', 'Care'].map(section => (
              <div key={section}>
                <p className="text-[10px] font-bold text-[#A3A3A2] uppercase tracking-wider mb-2 ml-1">{section}</p>
                <nav className="space-y-0.5">
                  {sidebarItems.filter(i => i.section === section).map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-[6px] text-sm font-medium transition-all ${
                        activeTab === item.id 
                          ? 'bg-[#F4F4F3] text-[#0A0A0A]' 
                          : 'text-[#A3A3A2] hover:bg-[#F4F4F3] hover:text-[#0A0A0A]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-[#0A0A0A]' : 'text-[#A3A3A2]'}`} />
                        {item.label}
                      </div>
                      {item.badge !== undefined && (
                        <span className="text-[10px] bg-[#F4F4F3] px-1.5 py-0.5 rounded border border-[#E5E5E4] font-bold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto p-4 border-t border-[#E5E5E4]">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 bg-[#F4F4F3] rounded-full border border-[#E5E5E4] flex items-center justify-center text-xs font-bold uppercase">
              {profile?.name?.[0] || 'P'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate">{profile?.name || 'Patient'}</p>
              <p className="text-[10px] text-[#A3A3A2] truncate">{profile?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-[6px] text-[11px] font-bold text-[#B91C1C] hover:bg-[#FEF2F2] transition-all uppercase tracking-wide"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-[212px] flex-1 min-w-0">
        {/* Top Bar */}
        <header className="h-[56px] bg-white border-b border-[#E5E5E4] px-8 flex items-center justify-between sticky top-0 z-40">
          <h2 className="text-sm font-bold capitalize">
            {sidebarItems.find(i => i.id === activeTab)?.label}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#F4F4F3] px-3 py-1 rounded-[6px] border border-[#E5E5E4]">
              <Calendar className="w-3.5 h-3.5 text-[#A3A3A2]" />
              <span className="text-[11px] font-bold uppercase tracking-wide opacity-60">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <button className="p-1.5 hover:bg-[#F4F4F3] rounded-full transition-all text-[#A3A3A2] hover:text-[#0A0A0A]">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="p-8 max-w-[1200px] mx-auto">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Greeting */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight mb-1">
                    Welcome back, {profile?.name?.split(' ')[0] || 'Patient'}
                  </h1>
                  <p className="text-sm text-[#A3A3A2]">Here is what is happening with your health today.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('risk')}
                  className="bg-[#0A0A0A] text-white px-4 py-2 rounded-[10px] text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all"
                >
                  <Plus className="w-4 h-4" /> New assessment
                </button>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard 
                  label="Last risk score" 
                  value={records[0]?.bp || 'Low'} 
                  sub="Assessment run yesterday"
                  status={records[0]?.bp === 'high' ? 'red' : records[0]?.bp === 'medium' ? 'amber' : 'green'}
                />
                <MetricCard 
                  label="Assessments run" 
                  value={records.filter(r => !r.bp?.startsWith('MSG:')).length} 
                  sub="Total clinical entries"
                />
                <MetricCard 
                  label="Doctor messages" 
                  value={records.filter(r => r.bp?.startsWith('MSG:')).length} 
                  sub="Active consultations"
                />
              </div>

              {/* Panels Row */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Recent Records Panel */}
                <div className="bg-white border border-[#E5E5E4] rounded-[10px] overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E5E4] flex items-center justify-between">
                    <h3 className="text-sm font-bold tracking-tight">Recent records</h3>
                    <button onClick={() => setActiveTab('records')} className="text-xs font-bold text-[#A3A3A2] hover:text-[#0A0A0A]">View all</button>
                  </div>
                  <div className="divide-y divide-[#E5E5E4]">
                    {records.slice(0, 4).map(r => (
                      <div key={r.id} className="px-5 py-4 flex items-center justify-between hover:bg-[#FAFAF9] transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#F4F4F3] rounded-lg flex items-center justify-center text-[#A3A3A2]">
                            <History className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[13px] font-bold">{r.bp?.startsWith('MSG:') ? 'Consultation Message' : 'Clinical Assessment'}</p>
                            <p className="text-[11px] text-[#A3A3A2] uppercase font-bold tracking-tighter">ID: {r.id.slice(0, 8)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[13px] font-bold">
                            {r.glucose > 0 ? `${r.glucose} mg/dL` : 'Sent'}
                          </p>
                          <span className={`text-[10px] font-bold uppercase ${
                            r.bp === 'high' ? 'text-[#B91C1C]' : r.bp === 'medium' ? 'text-[#B45309]' : 'text-[#15803D]'
                          }`}>
                            {r.bp?.replace('MSG:', 'Chat') || 'Normal'}
                          </span>
                        </div>
                      </div>
                    ))}
                    {records.length === 0 && (
                      <div className="p-12 text-center text-[#A3A3A2] text-sm italic">No entries yet.</div>
                    )}
                  </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="space-y-6">
                  <h3 className="text-[11px] font-bold text-[#A3A3A2] uppercase tracking-wider ml-1">Quick actions</h3>
                  <div className="grid gap-3">
                    <QuickActionItem 
                      title="Run Risk Assessment" 
                      desc="Get instant AI insights on your clinical data."
                      icon={Activity}
                      onClick={() => setActiveTab('risk')}
                    />
                    <QuickActionItem 
                      title="Request Telehealth" 
                      desc="Chat securely with a certified specialist."
                      icon={MessageCircle}
                      onClick={() => setActiveTab('chat')}
                    />
                    <QuickActionItem 
                      title="Download Records" 
                      desc="Export your medical history as CSV."
                      icon={Download}
                      onClick={downloadCSV}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RISK PREDICTOR */}
          {activeTab === 'risk' && (
            <div className="grid md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-8 rounded-[10px] border border-[#E5E5E4]">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5" /> Risk indicators
                </h2>
                <form onSubmit={handlePredict} className="space-y-5">
                  <Input label="HbA1c Level (%)" value={hba1c} onChange={setHba1c} placeholder="e.g. 5.7" />
                  <Input label="Fasting Blood Sugar (mg/dL)" value={fbs} onChange={setFbs} placeholder="e.g. 99" />
                  <Input label="BMI (kg/m²)" value={bmiInput} onChange={setBmiInput} placeholder="e.g. 24.5" />
                  <Input label="Cholesterol (mg/dL)" value={cholesterol} onChange={setCholesterol} placeholder="e.g. 180" />
                  <Input label="Age (years)" value={ageInput} onChange={setAgeInput} placeholder="e.g. 45" />
                  <button 
                    type="submit" 
                    disabled={predictLoading}
                    className="w-full bg-[#0A0A0A] text-white py-3.5 rounded-[10px] font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 mt-4"
                  >
                    {predictLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Run Prediction'}
                  </button>
                </form>
              </div>

              <div className="space-y-6">
                {predictError && (
                  <div className="bg-[#FEF2F2] border border-[#FEF2F2] p-6 rounded-[10px] flex items-start gap-4">
                    <AlertCircle className="w-5 h-5 text-[#B91C1C] shrink-0" />
                    <p className="text-[#B91C1C] font-bold text-xs">{predictError}</p>
                  </div>
                )}

                {predictResult ? (
                  <div className={`p-8 rounded-[10px] border flex flex-col gap-6 ${
                    predictResult.status === 'high' ? 'bg-[#FEF2F2] border-[#FEF2F2]' : 
                    predictResult.status === 'medium' ? 'bg-[#FFFBEB] border-[#FFFBEB]' : 'bg-[#F0FDF4] border-[#F0FDF4]'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-white ${
                        predictResult.status === 'high' ? 'bg-[#B91C1C]' : 
                        predictResult.status === 'medium' ? 'bg-[#B45309]' : 'bg-[#15803D]'
                      }`}>
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold uppercase tracking-tight ${
                          predictResult.status === 'high' ? 'text-[#B91C1C]' : 
                          predictResult.status === 'medium' ? 'text-[#B45309]' : 'text-[#15803D]'
                        }`}>
                          {predictResult.status} Risk
                        </h3>
                        {predictResult.risk_probability && (
                          <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-0.5">Risk Probability: {Math.round(predictResult.risk_probability * 100)}%</p>
                        )}
                      </div>
                    </div>

                    <p className="text-sm font-medium text-[#0A0A0A]/80 leading-relaxed">
                      {predictResult.status === 'low' ? 'Your health indicators look good. Keep maintaining your healthy lifestyle.' : 
                       predictResult.status === 'medium' ? 'Consider dietary changes and regular exercise. Monitor your levels.' : 
                       'Please consult a doctor immediately for further clinical screening.'}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <button 
                        onClick={handleSaveResult}
                        disabled={saveLoading}
                        className="bg-white border border-[#E5E5E4] py-2.5 rounded-[10px] font-bold text-xs hover:bg-[#F4F4F3] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {saveLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Result'}
                      </button>
                      <button 
                        onClick={() => setActiveTab('chat')}
                        className="bg-[#0A0A0A] text-white py-2.5 rounded-[10px] font-bold text-xs hover:opacity-90 transition-all"
                      >
                        Consult Doctor
                      </button>
                    </div>
                  </div>
                ) : !predictError && (
                  <div className="bg-white border border-[#E5E5E4] border-dashed p-16 rounded-[10px] flex flex-col items-center text-center opacity-40">
                    <Activity className="w-12 h-12 text-[#A3A3A2] mb-4" />
                    <p className="text-xs font-bold text-[#A3A3A2]">Complete form to view analysis.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MY RECORDS */}
          {activeTab === 'records' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex items-center justify-between bg-white p-5 rounded-[10px] border border-[#E5E5E4]">
                <div className="flex gap-12">
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-bold text-[#A3A3A2] uppercase tracking-wider">Total Records</p>
                    <p className="text-xl font-bold">{records.length}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-bold text-[#A3A3A2] uppercase tracking-wider">Avg Glucose</p>
                    <p className="text-xl font-bold">
                      {Math.round(records.reduce((acc, curr) => acc + (curr.glucose || 0), 0) / (records.length || 1))} <span className="text-xs font-medium text-[#A3A3A2]">mg/dL</span>
                    </p>
                  </div>
                </div>
                <button 
                  onClick={downloadCSV}
                  className="bg-[#0A0A0A] text-white px-4 py-2 rounded-[10px] flex items-center gap-2 font-bold text-xs hover:opacity-90 transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Export Data
                </button>
              </div>

              <div className="bg-white rounded-[10px] border border-[#E5E5E4] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#F4F4F3] border-b border-[#E5E5E4]">
                      <tr>
                        <th className="px-6 py-3 text-[10px] font-bold text-[#A3A3A2] uppercase tracking-wider">Reference</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-[#A3A3A2] uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-[#A3A3A2] uppercase tracking-wider">Glucose</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-[#A3A3A2] uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5E4]">
                      {records.map((r) => (
                        <tr key={r.id} className="hover:bg-[#FAFAF9] transition-all">
                          <td className="px-6 py-4 text-xs font-bold text-[#A3A3A2]"># {r.id.slice(0, 8)}</td>
                          <td className="px-6 py-4 text-sm font-bold">Today</td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-bold">{r.glucose}</span>
                            <span className="text-[10px] font-bold text-[#A3A3A2] ml-1 uppercase">mg/dL</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-[4px] text-[10px] font-bold uppercase tracking-tight ${
                              r.bp === 'high' ? 'bg-[#FEF2F2] text-[#B91C1C]' : 
                              r.bp === 'medium' ? 'bg-[#FFFBEB] text-[#B45309]' : 'bg-[#F0FDF4] text-[#15803D]'
                            }`}>
                              {r.bp || 'Normal'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {records.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-20 text-center">
                            <p className="text-[#A3A3A2] font-bold text-sm mb-4 italic">No clinical history found.</p>
                            <button onClick={() => setActiveTab('risk')} className="bg-[#0A0A0A] text-white px-6 py-2 rounded-[10px] font-bold text-xs uppercase tracking-wide">Start Assessment</button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TELEHEALTH & CHAT */}
          {activeTab === 'chat' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {doctors.map(doc => (
                  <button 
                    key={doc.id} 
                    onClick={() => setSelectedDoctor(doc)}
                    className={`flex-shrink-0 w-60 bg-white p-5 rounded-[10px] border transition-all ${
                      selectedDoctor?.id === doc.id ? 'border-[#0A0A0A] ring-2 ring-[#0A0A0A]/5' : 'border-[#E5E5E4]'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#F4F4F3] rounded-[8px] flex items-center justify-center font-bold text-[#0A0A0A] border border-[#E5E5E4]">
                        {doc.profile?.name?.[0]}
                      </div>
                      <div className="text-left overflow-hidden">
                        <p className="font-bold text-sm truncate uppercase tracking-tight">Dr. {doc.profile?.name}</p>
                        <span className="text-[10px] font-bold text-[#A3A3A2] uppercase tracking-wide">{doc.specialization}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1.5 h-1.5 bg-[#15803D] rounded-full" />
                      <span className="text-[10px] font-bold text-[#15803D] uppercase tracking-wide">Available</span>
                    </div>
                    <div className="text-[10px] font-bold text-[#A3A3A2] leading-relaxed uppercase tracking-tighter">
                      Mon-Fri: 9AM - 5PM
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-[10px] border border-[#E5E5E4] flex flex-col h-[620px]">
                <div className="p-5 border-b border-[#E5E5E4] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#F4F4F3] rounded-[6px] border border-[#E5E5E4] flex items-center justify-center font-bold text-xs uppercase">
                      {selectedDoctor?.profile?.name?.[0] || '?'}
                    </div>
                    <p className="font-bold text-sm uppercase tracking-tight">
                      {selectedDoctor ? `Dr. ${selectedDoctor.profile.name}` : 'Select a doctor'}
                    </p>
                  </div>
                  <Shield className="w-4 h-4 text-[#A3A3A2]" />
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FAFAF9]/50">
                  {records.filter(r => r.bp?.startsWith('MSG:')).reverse().map(msg => (
                    <div key={msg.id} className="flex justify-end">
                      <div className="bg-[#0A0A0A] text-white p-4 rounded-[12px] rounded-tr-none max-w-[70%]">
                        <p className="text-sm font-medium leading-relaxed">{msg.bp.replace('MSG:', '')}</p>
                        <p className="text-[9px] font-bold text-[#A3A3A2] mt-2 uppercase tracking-wide">Sent</p>
                      </div>
                    </div>
                  ))}
                  {records.filter(r => r.bp?.startsWith('MSG:')).length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-[#A3A3A2] opacity-50 space-y-2">
                      <MessageCircle className="w-10 h-10" />
                      <p className="text-xs font-bold uppercase tracking-widest">No conversation history</p>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-5 border-t border-[#E5E5E4]">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      disabled={!selectedDoctor}
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder={selectedDoctor ? "Type your message..." : "Select a doctor above"}
                      className="flex-1 px-4 py-3 bg-[#F4F4F3] border border-[#E5E5E4] rounded-[10px] text-sm focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] disabled:opacity-50"
                    />
                    <button 
                      type="submit"
                      disabled={!selectedDoctor || !chatMessage.trim()}
                      className="bg-[#0A0A0A] text-white p-3.5 rounded-[10px] hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// UI HELPERS
function MetricCard({ label, value, sub, status }: any) {
  const statusColors: any = {
    green: 'text-[#15803D]',
    amber: 'text-[#B45309]',
    red: 'text-[#B91C1C]',
  };
  return (
    <div className="bg-white p-6 rounded-[10px] border border-[#E5E5E4] flex flex-col gap-2">
      <p className="text-[11px] font-bold text-[#A3A3A2] uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold tracking-tight uppercase ${status ? statusColors[status] : ''}`}>{value}</p>
      <p className="text-[11px] font-bold text-[#A3A3A2] uppercase tracking-tighter opacity-60">{sub}</p>
    </div>
  );
}

function QuickActionItem({ title, desc, icon: Icon, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="bg-white p-5 rounded-[10px] border border-[#E5E5E4] flex items-center justify-between hover:bg-[#FAFAF9] transition-all group text-left"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-[#F4F4F3] rounded-[8px] flex items-center justify-center text-[#0A0A0A] group-hover:bg-[#0A0A0A] group-hover:text-white transition-all border border-[#E5E5E4]">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight">{title}</p>
          <p className="text-[11px] text-[#A3A3A2] font-bold uppercase tracking-tighter">{desc}</p>
        </div>
      </div>
      <ArrowUpRight className="w-4 h-4 text-[#A3A3A2] group-hover:text-[#0A0A0A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
    </button>
  );
}

function Input({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-[#A3A3A2] uppercase tracking-widest ml-1">{label}</label>
      <input 
        type="number" 
        step="any"
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-white border border-[#E5E5E4] rounded-[10px] text-sm focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] transition-all"
      />
    </div>
  );
}

function Shield(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
