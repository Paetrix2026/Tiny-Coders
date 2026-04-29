import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Shield, Activity, FileText, Zap } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      window.location.replace('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans antialiased text-[#0A0A0A]">
      {/* Left Panel */}
      <div className="hidden lg:flex w-[40%] bg-[#0A0A0A] text-white p-16 flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-black font-bold">U</div>
            <span className="text-xl font-bold tracking-tight">Unified Health</span>
          </div>
          
          <h1 className="text-5xl font-medium leading-[1.1] tracking-tight mb-6">
            Intelligent health <br /> management.
          </h1>
          <p className="text-[#A3A3A2] text-lg max-w-sm leading-relaxed">
            A unified platform for patients to track records, predict risks, and connect with specialists.
          </p>
        </div>

        <div className="space-y-8">
          {[
            { icon: Activity, title: 'Risk Predictor', desc: 'AI-driven health risk assessment.' },
            { icon: Shield, title: 'Telehealth', desc: 'Secure consultation with doctors.' },
            { icon: FileText, title: 'Health Records', desc: 'Centralized medical history.' },
            { icon: Zap, title: 'Real-time Results', desc: 'Instant access to clinical data.' },
          ].map((feature, i) => (
            <div key={i} className="flex gap-4 items-start">
              <feature.icon className="w-5 h-5 text-white mt-1 shrink-0" />
              <div>
                <p className="font-medium text-sm">{feature.title}</p>
                <p className="text-[#A3A3A2] text-sm">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-[#FAFAF9] flex items-center justify-center p-8">
        <div className="w-full max-w-[380px]">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Sign in</h2>
            <p className="text-[#A3A3A2] text-sm">Enter your credentials to access your portal.</p>
          </div>

          {/* Role Toggle */}
          <div className="flex bg-[#F4F4F3] p-1 rounded-lg mb-8 border border-[#E5E5E4]">
            <button className="flex-1 py-2 text-sm font-bold bg-white rounded-[6px] border border-[#E5E5E4] transition-all">
              Patient
            </button>
            <button disabled className="flex-1 py-2 text-sm font-medium text-[#A3A3A2] cursor-not-allowed">
              Doctor <span className="text-[10px] opacity-60 ml-1">Coming soon</span>
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-[#A3A3A2] uppercase tracking-wider mb-1.5 ml-1">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#E5E5E4] rounded-[10px] text-sm focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] transition-all"
                placeholder="name@example.com"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1.5 ml-1">
                <label className="text-[11px] font-bold text-[#A3A3A2] uppercase tracking-wider">Password</label>
                <a href="#" className="text-[11px] font-bold text-[#0A0A0A] uppercase hover:underline">Forgot?</a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#E5E5E4] rounded-[10px] text-sm focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-[#B91C1C] text-xs font-medium bg-[#FEF2F2] p-3 rounded-[10px] border border-[#FEF2F2]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0A0A0A] text-white py-3.5 rounded-[10px] font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? 'Processing...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-[#A3A3A2]">
              Don't have an account? <Link to="/signup" className="text-[#0A0A0A] font-bold hover:underline">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
