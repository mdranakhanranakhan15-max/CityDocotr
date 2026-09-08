'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquareQuote,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  X,
  RefreshCw,
  Save,
  Search,
  Settings2,
  Star,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface Review {
  id: string;
  name: string;
  location: string;
  text: string;
  rating: number;
  service: string;
  isActive: boolean;
  createdAt: string;
}

const emptyForm = {
  name: '',
  location: '',
  text: '',
  rating: '5',
  service: '',
};

type CountMode = 'auto' | 'custom';

// Testimonial section header settings shown on the public homepage. The form
// starts pre-filled with these current homepage defaults; saving persists them
// as admin overrides (blank values keep the site's built-in bilingual copy).
const DEFAULT_SECTION_CFG: {
  title: string;
  subtitle: string;
  countMode: CountMode;
  customCount: string;
} = {
  title: 'Loved by Over 500,000+ Patients',
  subtitle: 'VERIFIED PATIENT EXPERIENCES',
  countMode: 'auto',
  customCount: '',
};

const starCount = (n: number) => Math.max(1, Math.min(5, Math.round(Number(n) || 5)));

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  // Homepage testimonial section header config (Admin -> Reviews).
  const [sectionCfg, setSectionCfg] = useState(DEFAULT_SECTION_CFG);
  const [publishedCount, setPublishedCount] = useState(0);
  const [isCfgSaving, setIsCfgSaving] = useState(false);
  const [isCfgLoading, setIsCfgLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/reviews?all=true');
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
        setPublishedCount(
          Array.isArray(data.reviews)
            ? data.reviews.filter((r: any) => r.isActive).length
            : 0
        );
      }
      else setMessage({ type: 'error', text: data.message || 'Failed to load reviews' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Load the homepage testimonial section header settings + live published count.
  const fetchSectionConfig = useCallback(async () => {
    setIsCfgLoading(true);
    try {
      const res = await fetch('/api/reviews/settings', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        // Pre-fill with the homepage defaults whenever nothing has been saved
        // in the DB yet, so the admin always sees the current section copy.
        setSectionCfg({
          title: String(data.config?.title || '').trim() || DEFAULT_SECTION_CFG.title,
          subtitle:
            String(data.config?.subtitle || '').trim() || DEFAULT_SECTION_CFG.subtitle,
          countMode: data.config?.countMode === 'custom' ? 'custom' : 'auto',
          customCount: String(data.config?.customCount || '').trim(),
        });
        if (typeof data.activeCount === 'number') setPublishedCount(data.activeCount);
      }
    } catch (err: any) {
      // Non-fatal — settings just stay on their defaults.
      console.error('Error fetching review section settings:', err);
    } finally {
      setIsCfgLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSectionConfig();
  }, [fetchSectionConfig]);

  // Persist the section header settings and publish them to the homepage.
  const handleSaveSectionConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCfgSaving(true);
    setMessage(null);
    try {
      const payload = {
        title: sectionCfg.title.trim(),
        subtitle: sectionCfg.subtitle.trim(),
        countMode: sectionCfg.countMode,
        customCount:
          sectionCfg.countMode === 'custom' ? sectionCfg.customCount.trim() : '',
      };
      const res = await fetch('/api/reviews/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({
          type: 'success',
          text: 'Testimonial section settings published to the homepage.',
        });
        if (typeof data.activeCount === 'number') setPublishedCount(data.activeCount);
        fetchSectionConfig();
      } else {
        setMessage({
          type: 'error',
          text: data.message || data.error || 'Failed to save section settings',
        });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save section settings' });
    } finally {
      setIsCfgSaving(false);
    }
  };

  const filtered = reviews.filter((r) =>
    query.trim()
      ? [r.name, r.location, r.service, r.text]
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

  const openEdit = (r: Review) => {
    setEditing(r);
    setForm({
      name: r.name,
      location: r.location || '',
      text: r.text || '',
      rating: String(r.rating || 5),
      service: r.service || '',
    });
    setMessage(null);
    setModalOpen(true);
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setMessage({ type: 'error', text: 'Patient name is required.' });
      return;
    }
    if (!form.text.trim()) {
      setMessage({ type: 'error', text: 'Review text is required.' });
      return;
    }
    setIsSubmitting(true);
    setMessage(null);
    try {
      const payload = {
        name: form.name.trim(),
        location: form.location.trim(),
        text: form.text.trim(),
        rating: starCount(Number(form.rating)),
        service: form.service.trim(),
      };
      const url = editing ? `/api/reviews/${editing.id}` : '/api/reviews';
      const res = await fetch(url, {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: editing ? 'Review updated.' : 'Review added.' });
        setModalOpen(false);
        fetchReviews();
      } else {
        setMessage({ type: 'error', text: data.message || 'Save failed' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Save failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (r: Review) => {
    try {
      const res = await fetch(`/api/reviews/${r.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !r.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({
          type: 'success',
          text: r.isActive ? 'Review hidden from homepage.' : 'Review published to homepage.',
        });
        fetchReviews();
      } else {
        setMessage({ type: 'error', text: data.message || 'Update failed' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Update failed' });
    }
  };

  const handleDelete = async (r: Review) => {
    if (!confirm(`Delete review from ${r.name}?`)) return;
    try {
      const res = await fetch(`/api/reviews/${r.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Review deleted.' });
        fetchReviews();
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
            <MessageSquareQuote className="w-5 h-5" />
            <span className="text-[11px] font-black uppercase tracking-[0.22em]">
              Patient Testimonials
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-100 mt-2 tracking-tight">
            Reviews Management CMS
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 max-w-xl leading-relaxed">
            CRUD management for the verified patient reviews shown on the public homepage.
            Add, edit, hide, or delete testimonials — published live with each save.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 text-xs font-black shadow-lg shadow-teal-500/20 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" /> Add Review
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

      {/* ===== Section Header Settings (published to homepage testimonials) ===== */}
      <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-5 lg:p-6 space-y-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 text-teal-300 flex items-center justify-center shrink-0">
              <Settings2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm font-black text-slate-100 tracking-tight">
                Testimonial Section Settings
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Control the heading shown above the patient review grid on the public homepage —
                saved changes go live instantly.
              </p>
            </div>
          </div>
          {isCfgLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
          ) : (
            <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
              {publishedCount} published review{publishedCount === 1 ? '' : 's'}
            </span>
          )}
        </div>

        <form onSubmit={handleSaveSectionConfig} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Section Title</label>
              <input
                type="text"
                value={sectionCfg.title}
                onChange={(e) => setSectionCfg((c) => ({ ...c, title: e.target.value }))}
                placeholder="Loved by Over 500,000+ Patients"
                className={inputCls}
              />
              <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                Main heading of the homepage testimonials section. Leave empty to keep the
                built-in copy. Use{' '}
                <code className="text-teal-400 bg-slate-950/80 px-1.5 py-0.5 rounded-md font-mono">
                  {'{count}'}
                </code>{' '}
                to insert the review number chosen below (e.g. &quot;Loved by Over{' '}
                {'{count}'}+ Patients&quot;).
              </p>
            </div>
            <div>
              <label className={labelCls}>Section Subtitle</label>
              <input
                type="text"
                value={sectionCfg.subtitle}
                onChange={(e) => setSectionCfg((c) => ({ ...c, subtitle: e.target.value }))}
                placeholder="VERIFIED PATIENT EXPERIENCES"
                className={inputCls}
              />
              <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                Small label shown above the heading (rendered in uppercase on the site).
                Leave empty to keep the built-in copy.
              </p>
            </div>
          </div>
          <div>
            <span className={labelCls}>Review Count Displayed in Heading</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSectionCfg((c) => ({ ...c, countMode: 'auto' }))}
                className={`text-left rounded-2xl border p-3.5 transition-colors ${
                  sectionCfg.countMode === 'auto'
                    ? 'bg-teal-500/10 border-teal-500/50 ring-1 ring-teal-500/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-slate-100">
                    Automatic — Live DB Count
                  </span>
                  <span
                    className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      sectionCfg.countMode === 'auto'
                        ? 'border-teal-400 bg-teal-400'
                        : 'border-slate-600'
                    }`}
                  >
                    {sectionCfg.countMode === 'auto' && (
                      <span className="w-1 h-1 rounded-full bg-slate-950" />
                    )}
                  </span>
                </span>
                <span className="block text-[10.5px] text-slate-500 mt-1 leading-relaxed">
                  Use the real number of published reviews
                  {!isCfgLoading && (
                    <span className="text-teal-300 font-bold">
                      {' '}
                      ({publishedCount} now)
                    </span>
                  )}{' '}
                  inside the {'{count}'} placeholder.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSectionCfg((c) => ({ ...c, countMode: 'custom' }))}
                className={`text-left rounded-2xl border p-3.5 transition-colors ${
                  sectionCfg.countMode === 'custom'
                    ? 'bg-teal-500/10 border-teal-500/50 ring-1 ring-teal-500/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-slate-100">
                    Custom Display Number
                  </span>
                  <span
                    className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      sectionCfg.countMode === 'custom'
                        ? 'border-teal-400 bg-teal-400'
                        : 'border-slate-600'
                    }`}
                  >
                    {sectionCfg.countMode === 'custom' && (
                      <span className="w-1 h-1 rounded-full bg-slate-950" />
                    )}
                  </span>
                </span>
                <span className="block text-[10.5px] text-slate-500 mt-1 leading-relaxed">
                  Show a fixed value such as &quot;500,000+&quot; instead of the live count.
                </span>
              </button>
            </div>

            {sectionCfg.countMode === 'custom' && (
              <div className="mt-3">
                <label className={labelCls}>Custom Number</label>
                <input
                  type="text"
                  value={sectionCfg.customCount}
                  onChange={(e) =>
                    setSectionCfg((c) => ({ ...c, customCount: e.target.value }))
                  }
                  placeholder="e.g. 500,000+"
                  className={inputCls}
                />
                <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                  Falls back to the live DB review count when this field is empty.
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="submit"
              disabled={isCfgSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 text-xs font-black shadow-lg shadow-teal-500/20 transition-all disabled:opacity-60"
            >
              {isCfgSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Section Titles
            </button>
          </div>
        </form>
      </div>

      {/* ===== Toolbar ===== */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 md:max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reviews..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-bold">{reviews.length} reviews</span>
          <button
            onClick={fetchReviews}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-teal-300 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
{/* ===== Review cards ===== */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center gap-3 text-slate-500 rounded-3xl bg-slate-900/60 border border-slate-800">
          <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
          <p className="text-xs font-semibold">Loading reviews...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
          <MessageSquareQuote className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No reviews found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {reviews.length === 0
              ? 'Add your first patient review — it appears instantly on the homepage testimonials section.'
              : 'Try a different search.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((r) => (
            <div
              key={r.id}
              className={`relative rounded-3xl bg-slate-900/70 border p-5 flex flex-col gap-4 transition-all hover:border-slate-600 ${
                r.isActive ? 'border-slate-800' : 'border-slate-800 opacity-55'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < starCount(r.rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-700 text-slate-700'
                      }`}
                    />
                  ))}
                </div>
                {!r.isActive && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 text-[9.5px] font-bold uppercase tracking-wider">
                    Hidden
                  </span>
                )}
              </div>

              <p className="text-xs leading-relaxed text-slate-300 line-clamp-5">{r.text}</p>

              <div className="flex items-center gap-2.5 pt-3 border-t border-slate-800">
                <span className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0">
                  {r.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-100 text-xs truncate">{r.name}</p>
                  <p className="text-[10.5px] text-slate-500 truncate">
                    {r.location || '—'}
                    {r.service ? ` • ${r.service}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800">
                <button
                  onClick={() => handleToggleActive(r)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-colors ${
                    r.isActive
                      ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                      : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30'
                  }`}
                >
                  {r.isActive ? 'Hide' : 'Publish'}
                </button>
                <button
                  onClick={() => openEdit(r)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-teal-300 transition-colors"
                  title="Edit review"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(r)}
                  className="p-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
                  title="Delete review"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
{/* ===== Add / Edit modal ===== */}
      {modalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <MessageSquareQuote className="w-5 h-5 text-teal-400" />
                <h2 className="font-bold text-slate-100 text-sm">
                  {editing ? 'Edit Review' : 'Add New Review'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={labelCls}>Patient Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Shahrin Sultana"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Location / City</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    placeholder="e.g. Uttara, Dhaka"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={labelCls}>Rating (1 - 5)</label>
                  <select
                    value={form.rating}
                    onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
                    className={inputCls}
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={String(n)}>
                        {'★'.repeat(n)} ({n} Star{n === 1 ? '' : 's'})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Service / Department Tag</label>
                  <input
                    type="text"
                    value={form.service}
                    onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
                    placeholder="e.g. Pediatrics Consultation"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Review Text</label>
                <textarea
                  value={form.text}
                  onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
                  rows={4}
                  placeholder="e.g. CityDoctor connected me with a specialist in minutes..."
                  className={`${inputCls} resize-none leading-relaxed`}
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Any &quot;DocTime&quot; mention is automatically replaced with &quot;CityDoctor&quot; on save.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
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
                  {editing ? 'Save Changes' : 'Add Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
