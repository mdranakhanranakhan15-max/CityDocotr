'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, Plus, Pencil, Trash2, Loader2, CheckCircle2, AlertCircle, Save, X, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react';

interface Sym { id: string; title: string; slug: string; image: string | null; linkedDepartmentId: string | null; departmentTitle?: string | null; departmentSlug?: string | null; order: number; isActive: boolean; }
interface Dept { id: string; title: string; slug: string; }
const EMPTY = { title: '', image: '', linkedDepartmentId: '' };

export default function AdminSymptomsPage() {
  const [items, setItems] = useState<Sym[]>([]);
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [sRes, dRes] = await Promise.all([
        fetch('/api/symptoms?all=true', { cache: 'no-store' }),
        fetch('/api/departments?all=true', { cache: 'no-store' }),
      ]);
      const sData = await sRes.json();
      const dData = await dRes.json();
      if (sData.success) setItems(sData.symptoms);
      if (dData.success) setDepartments(dData.departments);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      const res = await fetch(editingId ? `/api/symptoms/${editingId}` : '/api/symptoms', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ ok: true, text: editingId ? 'Symptom updated.' : 'Symptom added.' });
        setForm(EMPTY); setEditingId(null); load();
      } else setMsg({ ok: false, text: data.error || 'Failed to save.' });
    } catch { setMsg({ ok: false, text: 'Failed to save. Please try again.' }); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this symptom card?')) return;
    const res = await fetch(`/api/symptoms/${id}`, { method: 'DELETE' });
    const data = await res.json();
    setMsg(data.success ? { ok: true, text: 'Symptom deleted.' } : { ok: false, text: data.error || 'Failed to delete.' });
    if (data.success) load();
  };

  // Reorder by swapping the order value with the neighbour row.
  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const a = items[index], b = items[target];
    await Promise.all([
      fetch(`/api/symptoms/${a.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: b.order }) }),
      fetch(`/api/symptoms/${b.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order: a.order }) }),
    ]);
    load();
  };

  return (
    <div className="space-y-6 w-full select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-widest">
            <BarChart3 className="w-4 h-4" /><span>Site Content</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">Symptoms CMS</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Manage the symptom cards on the homepage &quot;Symptoms&quot; tab. Each card deep-links to the doctor search filtered by its linked department.</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/70 border border-slate-700 text-slate-300 text-xs font-bold hover:border-teal-500/50">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {msg && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] border ${msg.ok ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-red-500/10 text-red-300 border-red-500/30'}`}>
          {msg.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}<span>{msg.text}</span>
        </div>
      )}

      <section className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5">
        <h2 className="font-bold text-slate-100 text-base flex items-center gap-2">
          {editingId ? <Pencil className="w-4 h-4 text-teal-400" /> : <Plus className="w-4 h-4 text-teal-400" />}
          {editingId ? 'Edit Symptom' : 'Add New Symptom'}
        </h2>
        <form onSubmit={submit} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title (e.g. Period problems)" className="px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 focus:border-teal-500/50 text-slate-200 text-xs outline-none placeholder:text-slate-600" />
          <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Image URL (optional)" className="px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 focus:border-teal-500/50 text-slate-200 text-xs font-mono outline-none placeholder:text-slate-600" />
          <select value={form.linkedDepartmentId} onChange={(e) => setForm({ ...form, linkedDepartmentId: e.target.value })} className="px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 focus:border-teal-500/50 text-slate-200 text-xs outline-none">
            <option value="">No linked department</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-600/25 active:scale-95 transition-all disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingId ? 'Save Changes' : 'Add Symptom'}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY); }} className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold">
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5">
        <h2 className="font-bold text-slate-100 text-base mb-4">Current Symptoms ({items.length})</h2>
        {loading ? (
          <div className="flex items-center gap-2 text-slate-400 text-xs"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
        ) : (
          <div className="space-y-2">
            {items.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="p-0.5 text-slate-500 hover:text-teal-400 disabled:opacity-30"><ChevronUp className="w-3.5 h-3.5" /></button>
                  <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="p-0.5 text-slate-500 hover:text-teal-400 disabled:opacity-30"><ChevronDown className="w-3.5 h-3.5" /></button>
                </div>
                {s.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.image} alt={s.title} className="w-10 h-10 rounded-lg object-cover border border-slate-700" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-200 truncate">{s.title} {!s.isActive && <span className="text-amber-400">(hidden)</span>}</p>
                  <p className="text-[11px] text-slate-500 truncate">→ {s.departmentTitle || 'no linked department'}</p>
                </div>
                <button onClick={() => { setEditingId(s.id); setForm({ title: s.title, image: s.image || '', linkedDepartmentId: s.linkedDepartmentId || '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-2 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-slate-800"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => remove(s.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {items.length === 0 && <p className="text-xs text-slate-500">No symptoms yet. Add one above or visit the homepage to auto-seed defaults.</p>}
          </div>
        )}
      </section>
    </div>
  );
}
