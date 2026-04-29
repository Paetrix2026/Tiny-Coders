import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Send, User, Stethoscope, MessageSquare, ShieldCheck } from 'lucide-react';

export default function Telehealth() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch doctors joined with profiles
      const { data: docData } = await supabase
        .from('doctors')
        .select('*, profile:profiles(name)');
      setDoctors(docData || []);

      // 2. Fetch existing notes from records as messages
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: recs } = await supabase
          .from('records')
          .select('*')
          .eq('patient_id', user.id)
          .order('id', { ascending: false });
        setMessages(recs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('records')
        .insert({
          patient_id: user.id,
          glucose: 0,
          bp: message
        });

      if (error) throw error;
      setMessage('');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 uppercase font-black text-xs">Connecting to clinical network...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-blue-600" /> Connect with a Doctor
        </h1>
        <p className="text-slate-500">Secure video consultations and instant messaging with healthcare professionals.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Chat Panel */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-[500px]">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Live Chat Support</span>
              </div>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat">
              {messages.length === 0 && (
                <div className="text-center py-20 text-slate-400">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-10" />
                  <p className="text-sm font-medium">Send a message to start a consultation.</p>
                </div>
              )}
              {messages.map((m) => (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[80%] bg-blue-600 text-white p-4 rounded-2xl rounded-tr-none shadow-md shadow-blue-100">
                    <p className="text-sm leading-relaxed">{m.bp}</p>
                    <p className="text-[9px] text-blue-100 mt-2 font-bold uppercase tracking-widest">Sent • Just Now</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white rounded-b-xl">
              <div className="flex gap-2">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your symptoms or questions here..."
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-12"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>


        </div>

        {/* Doctors Panel */}
        <div className="space-y-4">
          <div className="bg-white p-4 border border-slate-200 rounded-xl">
            <h3 className="font-bold text-slate-900 text-sm mb-4 uppercase tracking-widest border-b border-slate-100 pb-2">Available Specialists</h3>
            <div className="space-y-3">
              {doctors.map((doc) => (
                <div key={doc.id} className="p-4 border border-slate-100 rounded-xl hover:border-blue-200 transition-colors bg-slate-50/50">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-blue-600 shrink-0 shadow-sm">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Dr. {doc.profile?.name}</p>
                      <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tight">{doc.specialization}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase">Available</span>
                      </div>
                    </div>
                  </div>
                  <button className="w-full mt-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                    Request Consultation
                  </button>
                </div>
              ))}
              {doctors.length === 0 && <p className="text-center text-xs text-slate-400 py-8">No doctors online.</p>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
