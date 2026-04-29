import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function MyRecords() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: recs } = await supabase
          .from('records')
          .select('*')
          .eq('patient_id', user.id)
          .order('id', { ascending: false });
        setRecords(recs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">Loading records...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-6">Your Records</h1>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Glucose</th>
              <th className="px-6 py-4">Risk/BP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {records.map(r => (
              <tr key={r.id}>
                <td className="px-6 py-4 text-sm font-mono text-slate-400">{r.id.slice(0,8)}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900">{r.glucose} mg/dL</td>
                <td className="px-6 py-4 text-sm text-slate-600">{r.bp}</td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-slate-400">No records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
