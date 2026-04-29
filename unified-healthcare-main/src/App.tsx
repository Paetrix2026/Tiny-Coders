import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Sidebar from './components/common/Sidebar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import Appointments from './pages/Appointments';
import Telehealth from './pages/Telehealth';
import { cn } from './lib/utils';
import './lib/i18n';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'patient' | 'doctor' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRole(docSnap.data().role);
        } else {
          // If profile doesn't exist, we might have a race condition or a new user without doc
          setRole('patient'); 
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="flex bg-slate-50 min-h-screen font-sans text-slate-900 border-slate-200 overflow-x-hidden">
        {user && role && <Sidebar role={role} />}
        <main className={cn(
          "flex-1 min-h-screen transition-all duration-300 flex flex-col",
          user ? "ml-64 bg-slate-50" : "w-full"
        )}>
          {user && (
            <header className="h-14 bg-white border-b flex items-center justify-between px-8 shrink-0 relative z-10">
              <div className="flex items-center gap-4">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">System Overview</h2>
                <div className="h-4 w-px bg-slate-200"></div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">PostgreSQL Connected</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold">API Active</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-md px-3 py-1.5 bg-slate-50 border-slate-200">
                  <span className="text-[9px] font-black text-slate-400 mr-2 uppercase tracking-tighter">Quick Search</span>
                  <input type="text" className="bg-transparent border-none text-xs outline-none w-48 font-medium" placeholder="Patient ID..." />
                </div>
              </div>
            </header>
          )}

          <div className={cn("flex-1", user ? "p-6" : "")}>
            <Routes>
              <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
              <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
              
              <Route path="/dashboard" element={
                user ? (role === 'doctor' ? <Navigate to="/doctor-dashboard" /> : <Dashboard />) : <Navigate to="/login" />
              } />
              <Route path="/doctor-dashboard" element={user && role === 'doctor' ? <DoctorDashboard /> : <Navigate to="/dashboard" /> } />
              <Route path="/patients" element={user && role === 'doctor' ? <DoctorDashboard /> : <Navigate to="/dashboard" /> } />
              <Route path="/appointments" element={user ? <Appointments /> : <Navigate to="/login" />} />
              <Route path="/telehealth" element={user ? <Telehealth /> : <Navigate to="/login" />} />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>

          {user && (
            <footer className="h-8 bg-slate-900 text-white flex items-center px-6 justify-between text-[10px] shrink-0">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Database Online</span>
                <span className="flex items-center gap-1.5 text-slate-400">|</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> AI Engine Stable</span>
              </div>
              <div className="text-slate-500 font-bold uppercase tracking-widest">
                Unified Health v1.0.2 • Secure AES-256
              </div>
            </footer>
          )}
        </main>
      </div>
    </BrowserRouter>
  );
}
