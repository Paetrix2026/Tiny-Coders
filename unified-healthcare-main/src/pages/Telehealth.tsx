import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  MessageSquare, 
  Send, 
  Video, 
  Phone, 
  MoreVertical, 
  User, 
  Stethoscope, 
  Activity,
  Mic,
  Smile,
  Plus,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function Telehealth() {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([
    { id: 1, sender: 'doctor', text: 'Hello! I have reviewed your latest AI health risk report. How are you feeling today?', time: '10:00 AM' },
    { id: 2, sender: 'patient', text: 'Hi Doctor. I am feeling a bit tired, but generally okay.', time: '10:02 AM' },
    { id: 3, sender: 'doctor', text: 'Your glucose levels are slightly elevated. We should discuss your diet in our video call later today.', time: '10:05 AM' }
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    setChat([...chat, { id: Date.now(), sender: 'patient', text: message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setMessage('');
  };

  return (
    <div className="h-[calc(100vh-14rem)] flex rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden text-slate-900">
      {/* Sidebar: Doctor/Consult Info */}
      <div className="w-72 border-r border-slate-100 flex flex-col bg-slate-50/30">
        <div className="p-5 border-b border-slate-100 bg-white">
          <h2 className="text-xs font-black text-slate-800 tracking-widest uppercase">Consultations</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="p-3 bg-white rounded-lg border border-blue-100 flex items-center gap-3 cursor-pointer shadow-sm">
            <img src="https://ui-avatars.com/api/?name=Sarah+Chen&background=random" className="w-10 h-10 rounded-lg" alt="doc" />
            <div className="flex-1">
              <div className="text-xs font-bold text-slate-900 leading-none">Dr. Sarah Chen</div>
              <div className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-blue-600 animate-pulse"></div>
                Active Now
              </div>
            </div>
          </div>
          <div className="p-3 rounded-lg hover:bg-white transition-all flex items-center gap-3 cursor-pointer opacity-50 group">
            <img src="https://ui-avatars.com/api/?name=James+Wilson&background=random" className="w-10 h-10 rounded-lg" alt="doc" />
            <div className="flex-1">
              <div className="text-xs font-bold text-slate-900 leading-none group-hover:text-blue-600">Dr. James Wilson</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Offline</div>
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-slate-100 bg-white space-y-3">
           <div className="flex items-center justify-between text-[9px] font-bold uppercase text-slate-400 tracking-widest">
              <span>Security Hub</span>
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
           </div>
           <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
             <div className="w-full h-full bg-emerald-500"></div>
           </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="px-6 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="relative">
                <img src="https://ui-avatars.com/api/?name=Sarah+Chen&background=random" className="w-8 h-8 rounded-lg" alt="doc" />
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
             </div>
             <div>
                <div className="text-xs font-bold text-slate-900 leading-none">Sarah Chen</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Medical Specialist</div>
             </div>
          </div>
          <div className="flex gap-1.5">
             <button className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all">
                <Video className="w-3.5 h-3.5" />
             </button>
             <button className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all">
                <Phone className="w-3.5 h-3.5" />
             </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20">
          {chat.map(m => (
            <div key={m.id} className={cn("flex", m.sender === 'patient' ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-md p-3 rounded-lg shadow-sm border",
                m.sender === 'patient' 
                  ? "bg-slate-900 text-white border-slate-900 rounded-tr-none" 
                  : "bg-white text-slate-700 border-slate-100 rounded-tl-none"
              )}>
                <p className="text-[11px] font-medium leading-relaxed">{m.text}</p>
                <div className={cn("text-[8px] font-bold mt-1.5 opacity-50 uppercase tracking-widest", m.sender === 'patient' ? "text-right text-slate-400" : "text-slate-400")}>
                  {m.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-6 bg-white border-t border-slate-100">
          <div className="flex gap-2 items-center bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
            <input 
              type="text" 
              placeholder="Type security-encrypted message..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-transparent border-none outline-none font-medium text-xs text-slate-700"
            />
            <div className="flex gap-0.5">
              <button 
                onClick={handleSend}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm text-xs font-bold uppercase tracking-widest"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
