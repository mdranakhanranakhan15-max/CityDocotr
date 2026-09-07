'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  HeartPulse,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  X,
  RefreshCw,
  Search,
  Star,
  Users,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface HealthPlan {
  id: string;
  name: string;
  tagline: string;
  familyMembers: number;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  popular: boolean;
  isActive: boolean;
  createdAt: string;
}

const emptyForm = {
  name: '',
  tagline: '',
  familyMembers: '1',
  monthlyPrice: '',
  yearlyPrice: '',
  features: '',
  popular: false,
};

const bdt = (n?: number | string | null) =>
  Number(n || 0) > 0 ? `৳${Number(n || 0).toLocaleString('en-US')}` : '—';

const featuresToText = (features: string[]) => (features || []).join('\n');

export default function AdminHealthPlansPage() {
  const [plans, setPlans] = useState<HealthPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HealthPlan | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/health-plans?all=true');
      const data = await res.json();
      if (data.success) setPlans(data.plans || []);
      else setMessage({ type: 'error', text: data.message || 'Failed to load plans' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const filtered = plans.filter((p) =>
    query.trim()
      ? [p.name, p.tagline, ...(p.features || [])]
          .join(' ')
          .toLowerCase()
          .includes(query.toLowerCase())
      : true
  );

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setMessage(null);
    setModalOpen(true);
  };

  const openEdit = (p: HealthPlan) => {
    setEditing(p);
    setForm({
      name: p.name,
      tagline: p.tagline || '',
      familyMembers: String(p.familyMembers || 1),
      monthlyPrice: String(p.monthlyPrice || ''),
      yearlyPrice: String(p.yearlyPrice || ''),
      features: featuresToText(p.features),
      popular: p.popular,
    });
    setMessage(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setMessage({ type: 'error', text: 'Plan name is required.' });
      return;
    }
    setIsSubmitting(true);
    setMessage(null);
    try {
      const payload = {
        name: form.name,
        tagline: form.tagline,
        familyMembers: Number(form.familyMembers) || 1,
        monthlyPrice: Number(form.monthlyPrice) || 0,
        yearlyPrice: Number(form.yearlyPrice) || 0,
        features: form.features, // API normalises newline bullets -> array
        popular: form.popular,
      };
      const url = editing ? `/api/health-plans/${editing.id}` : '/api/health-plans';
      const res = await fetch(url, {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: editing ? 'Plan updated.' : 'Plan created.' });
        setModalOpen(false);
        fetchPlans();
      } else {
        setMessage({ type: 'error', text: data.message || 'Save failed' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Save failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (p: HealthPlan) => {
    if (!confirm(`Delete health plan "${p.name}"?`)) return;
    try {
      const res = await fetch(`/api/health-plans/${p.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Plan deleted.' });
        fetchPlans();
      } else {
        setMessage({ type: 'error', text: data.message || 'Delete failed' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Delete failed' });
    }
  };

  const inputCls =
    'w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500/60 transition-colors';
  const labelCls = 'block text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mb-1.5';

  return (
    <div className="space-y-7">
      {/* ===== Header ===== */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-teal-400">
            <HeartPulse className="w-5 h-5" />
            <span className="text-[11px] font-black uppercase tracking-[0.22em]">
              CityDoctor Plus Membership
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-100 mt-2 tracking-tight">
            Health Subscription Plans CMS
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 max-w-xl leading-relaxed">
            CRUD management for family membership plans — monthly &amp; yearly pricing, covered family
            members and feature bullets. Published live to the homepage Subscription section.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 text-xs font-black shadow-lg shadow-teal-500/20 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" /> Add Plan
        </button>
      </div>

      {message && message.type === 'success' && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {message.text}
        </div>
      )}
      {message && message.type === 'error' && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {message.text}
        </div>
      )}

      {/* ===== Toolbar ===== */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 md:max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search plans..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-bold">{plans.length} plans</span>
          <button
            onClick={fetchPlans}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-teal-300 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ===== Plan cards ===== */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center gap-3 text-slate-500 rounded-3xl bg-slate-900/60 border border-slate-800">
          <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
          <p className="text-xs font-semibold">Loading health plans...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
          <HeartPulse className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No health plans found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {plans.length === 0
              ? 'Create your first membership plan — it appears instantly on the homepage Subscription section.'
              : 'Try a different search.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <div
              key={p.id}
              className={`relative rounded-3xl bg-slate-900/70 border p-5 flex flex-col gap-4 transition-all hover:border-slate-600 ${
                p.popular ? 'border-teal-500/40 ring-1 ring-teal-500/20' : 'border-slate-800'
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                  <Star className="w-3 h-3 fill-slate-950" /> Popular
                </span>
              )}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-100 text-sm leading-snug">{p.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{p.tagline || '—'}</p>
                </div>
                <button
                  onClick={() => handleDelete(p)}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                  title="Delete plan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-bold bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2">
                  <Users className="w-3.5 h-3.5 text-teal-400" />
                  {p.familyMembers} Member{p.familyMembers > 1 ? 's' : ''}
                </div>
                <div className="text-[10px] text-slate-500 font-semibold">
                  <span className="text-emerald-300 font-black text-sm">৳{Number(p.monthlyPrice || 0).toLocaleString()}</span>/mo
                  <span className="mx-1 text-slate-700">•</span>
                  <span className="text-emerald-300 font-black text-sm">৳{Number(p.yearlyPrice || 0).toLocaleString()}</span>/yr
                </div>
              </div>

              <div className="space-y-1.5 flex-1">
                {(p.features && p.features.length ? p.features.slice(0, 4) : []).map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-[11px] text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{f}</span>
                  </div>
                ))}
                {!p.features?.length && (
                  <p className="text-[11px] text-slate-600 italic">No feature bullets yet</p>
                )}
              </div>

              <div className="pt-3 mt-auto border-t border-slate-800 flex items-center justify-end">
                <button
                  onClick={() => openEdit(p)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/25 text-[11px] font-bold transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== Add / Edit plan modal ===== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/80 backdrop-blur-sm p-4 md:p-8">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div>
                <h2 className="text-base font-black text-slate-100">
                  {editing ? 'Edit Health Plan' : 'Create Health Plan'}
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {editing ? `Updating "${editing.name}"` : 'New membership subscription plan'}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>Plan Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Family Total Protection"
                  className={inputCls}
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Tagline</label>
                <input
                  value={form.tagline}
                  onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                  placeholder="e.g. Complete medical safety net for parents and children"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Covered Family Members</label>
                <input
                  type="number"
                  min="1"
                  value={form.familyMembers}
                  onChange={(e) => setForm((f) => ({ ...f, familyMembers: e.target.value }))}
                  placeholder="e.g. 5"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Mark as Popular</label>
                <label className="flex items-center gap-2.5 h-[42px] px-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.popular}
                    onChange={(e) => setForm((f) => ({ ...f, popular: e.target.checked }))}
                    className="w-4 h-4 rounded accent-teal-500"
                  />
                  <span className="text-xs font-bold text-slate-300">Highlight on homepage</span>
                </label>
              </div>

              <div>
                <label className={labelCls}>Monthly Price (৳)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.monthlyPrice}
                  onChange={(e) => setForm((f) => ({ ...f, monthlyPrice: e.target.value }))}
                  placeholder="e.g. 750"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Yearly Price (৳)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.yearlyPrice}
                  onChange={(e) => setForm((f) => ({ ...f, yearlyPrice: e.target.value }))}
                  placeholder="e.g. 8990"
                  className={inputCls}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Feature Bullets (one per line)</label>
                <textarea
                  value={form.features}
                  onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
                  rows={5}
                  placeholder={'Unlimited video consultations with General Physicians\n10 Specialist consultations per year\n20% flat discount on medicines with free delivery'}
                  className={`${inputCls} resize-none leading-relaxed`}
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 text-xs font-black shadow-lg shadow-teal-500/20 transition-all disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editing ? 'Save Changes' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



