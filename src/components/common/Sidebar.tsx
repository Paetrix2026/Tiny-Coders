import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Activity, 
  FileText, 
  Video, 
  LogOut,
  User
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

export default function Sidebar() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [initials, setInitials] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();
        if (profile?.name) {
          setName(profile.name);
          setInitials(profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2));
        }
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.replace('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Risk Predictor', path: '/risk-predictor', icon: Activity },
    { name: 'My Records', path: '/records', icon: FileText },
    { name: 'Telehealth', path: '/telehealth', icon: Video },
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {initials || <User className="w-5 h-5" />}
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-bold text-slate-900 truncate">{name || 'Patient'}</p>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Patient Portal</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200",
              isActive 
                ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
