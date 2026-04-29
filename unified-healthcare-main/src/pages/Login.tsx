import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Lock, 
  User, 
  Stethoscope, 
  ArrowRight, 
  Chrome, 
  ChevronLeft 
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email,
          name,
          role,
          createdAt: new Date().toISOString()
        });
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userRef = doc(db, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName,
          role: 'patient', // Default to patient for Google sign-in
          createdAt: new Date().toISOString()
        });
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
      {/* Left side: Form */}
      <div className="flex flex-col justify-center px-8 md:px-20 bg-white border-r border-slate-200">
        <button 
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 mb-12 self-start transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Core Terminal
        </button>

        <div className="max-w-sm w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Authentication Required</span>
            <h2 className="text-xl font-bold text-slate-900 mt-1 mb-1">
              {isLogin ? 'Security Access' : 'Node Registration'}
            </h2>
            <p className="text-[11px] text-slate-400 font-medium mb-8">
              {isLogin ? 'Enter credentials to authorize clinical session' : 'Initialize a new medical identifier in the system'}
            </p>

            {/* Role Selection */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setRole('patient')}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all",
                    role === 'patient' 
                      ? "border-blue-600 bg-blue-50/50 text-blue-700" 
                      : "border-slate-100 bg-slate-50 text-slate-400"
                  )}
                >
                  <User className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">Patient</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('doctor')}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all",
                    role === 'doctor' 
                      ? "border-blue-600 bg-blue-50/50 text-blue-700" 
                      : "border-slate-100 bg-slate-50 text-slate-400"
                  )}
                >
                  <Stethoscope className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">Doctor</span>
                </button>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-3">
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="IDENTIFIER"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded text-[11px] font-bold outline-none focus:border-blue-400 transition-all uppercase placeholder:text-slate-300"
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="EMAIL_ADDR"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded text-[11px] font-bold outline-none focus:border-blue-400 transition-all uppercase placeholder:text-slate-300"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="SECURITY_KEY"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded text-[11px] font-bold outline-none focus:border-blue-400 transition-all uppercase placeholder:text-slate-300"
                />
              </div>

              {error && <p className="text-rose-600 text-[10px] font-black uppercase tracking-widest">{error}</p>}

              <button
                disabled={loading}
                className="w-full py-2.5 bg-slate-900 text-white rounded text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Authorizing...' : (isLogin ? 'Grant Access' : 'Register Identifier')}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-[9px] uppercase tracking-[0.2em] font-black text-slate-400">
                <span className="bg-white px-3">SSO Bypass</span>
              </div>
            </div>

            <button
              onClick={signInWithGoogle}
              className="w-full mt-6 py-2 px-3 border border-slate-200 rounded flex items-center justify-center gap-2 hover:bg-slate-50 transition-all text-[10px] font-black uppercase tracking-widest text-slate-600"
            >
              <Chrome className="w-4 h-4" /> Google Auth
            </button>

            <p className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {isLogin ? "System ID missing?" : "Access existing Node?"}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:underline"
              >
                {isLogin ? 'Register' : 'Login'}
              </button>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right side: Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-900 text-white relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <Stethoscope className="w-96 h-96" />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Stethoscope className="w-6 h-6" />
          </div>
          <span className="text-lg font-black tracking-widest uppercase">{t('app_name')}</span>
        </div>

        <div className="relative max-w-lg">
          <div className="w-8 h-1 bg-blue-600 mb-6"></div>
          <blockquote className="text-2xl font-bold mb-8 leading-tight">
            "The integration of AI into our clinical workflow has transformed how we manage high-risk patients. A must-have for modern clinics."
          </blockquote>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500 overflow-hidden border border-white/20">
              <img src="https://ui-avatars.com/api/?name=Dr+Sarah+Chen&background=random" alt="Doctor" />
            </div>
            <div>
              <div className="text-[11px] font-black uppercase tracking-widest">Dr. Sarah Chen</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Chief of Cardiology</div>
            </div>
          </div>
        </div>

        <div className="relative flex gap-8 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
          <div>SECURE_V4</div>
          <div>COMPLIANCE_HIPAA</div>
          <div>ENCRYPT_AES256</div>
        </div>
      </div>
    </div>
  );
}
