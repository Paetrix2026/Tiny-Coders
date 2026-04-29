import { 
  Plus, 
  Activity, 
  Users, 
  Clock, 
  MessageSquare, 
  LogOut, 
  Settings, 
  ShieldAlert,
  ChevronRight,
  Stethoscope,
  LayoutDashboard,
  Calendar,
  User
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface SidebarProps {
  role: 'patient' | 'doctor';
}

export default function Sidebar({ role }: SidebarProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'kn' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const navItems = [
    { name: t('dashboard'), path: role === 'doctor' ? '/doctor-dashboard' : '/dashboard', icon: LayoutDashboard },
    { name: t('appointments'), path: '/appointments', icon: Calendar },
    ...(role === 'doctor' ? [
      { name: t('patients'), path: '/patients', icon: Users },
    ] : [
      { name: t('telehealth'), path: '/telehealth', icon: MessageSquare },
    ]),
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0 z-50 h-screen">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
          <Stethoscope className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-bold tracking-tight uppercase">Unified Health</span>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-2">
        <div className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Main Navigation</div>
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2 rounded-md transition-all duration-200 group text-[13px] font-medium",
              location.pathname === item.path 
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon className={cn(
              "w-4 h-4",
              location.pathname === item.path ? "text-white" : "text-slate-500 group-hover:text-blue-400"
            )} />
            {item.name}
          </button>
        ))}

        <div className="px-4 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">System</div>
        <button
          onClick={toggleLanguage}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-xs font-medium"
        >
          <Settings className="w-4 h-4" />
          {t('language')}: {i18n.language.toUpperCase()}
        </button>
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-400/20 border border-blue-400/30 flex items-center justify-center">
             <User className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-white leading-none">System User</span>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter mt-1">{role} Access</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all text-xs font-bold uppercase tracking-widest"
        >
          <LogOut className="w-4 h-4" />
          {t('logout')}
        </button>
      </div>
    </aside>
  );
}
