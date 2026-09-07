'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Pill,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  X,
  Upload,
  RefreshCw,
  Search,
  PackageOpen,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface Medicine {
  id: string;
  name: string;
  category: string;
  brand: string;
  composition: string;
  form: string;
  imageUrl: string;
  regularPrice: number;
  discountedPrice: number;
  isActive: boolean;
  createdAt: string;
}

const emptyForm = {
  name: '',
  category: 'General',
  brand: '',
  composition: '',
  form: 'Medicine',
  imageUrl: '',
  regularPrice: '',
  discountedPrice: '',
};

const PRESET_CATEGORIES = [
  'General',
  'Fever & Pain',
  'Gastric & Acidity',
  'Vitamins & Supplements',
  'Respiratory & Allergy',
  'Allergy & Cold',
  'Diabetes Care',
  'First Aid',
];

const bdt = (n?: number | string | null) =>
  Number(n || 0) > 0 ? `৳${Number(n || 0).toLocaleString('en-US')}` : '—';

export default function AdminMedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Medicine | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchMedicines = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/medicines?all=true');
      const data = await res.json();
      if (data.success) setMedicines(data.medicines || []);
      else setMessage({ type: 'error', text: data.message || 'Failed to load medicines' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const categories = [
    'All',
    ...Array.from(new Set([...PRESET_CATEGORIES, ...medicines.map((m) => m.category)])),
  ];

  const filtered = medicines
    .filter((m) => (categoryFilter === 'All' ? true : m.category === categoryFilter))
    .filter((m) =>
      query.trim()
        ? [m.name, m.brand, m.composition, m.category]
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

  const openEdit = (m: Medicine) => {
    setEditing(m);
    setForm({
      name: m.name,
      category: m.category,
      brand: m.brand || '',
      composition: m.composition || '',
      form: m.form || 'Medicine',
      imageUrl: m.imageUrl || '',
      regularPrice: String(m.regularPrice || ''),
      discountedPrice: String(m.discountedPrice || ''),
    });
    setMessage(null);
    setModalOpen(true);
  };

  const uploadImage = async (file: File) => {
    setIsUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) setForm((f) => ({ ...f, imageUrl: data.url }));
      else setMessage({ type: 'error', text: data.error || 'Upload failed' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Upload failed' });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setMessage({ type: 'error', text: 'Medicine name is required.' });
      return;
    }
    setIsSubmitting(true);
    setMessage(null);
    try {
      const payload = {
        ...form,
        regularPrice: Number(form.regularPrice) || 0,
        discountedPrice: Number(form.discountedPrice) || 0,
      };
      const url = editing ? `/api/medicines/${editing.id}` : '/api/medicines';
      const res = await fetch(url, {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: editing ? 'Medicine updated.' : 'Medicine added.' });
        setModalOpen(false);
        fetchMedicines();
      } else {
        setMessage({ type: 'error', text: data.message || 'Save failed' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Save failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (m: Medicine) => {
    if (!confirm(`Delete "${m.name}" from the medicine catalogue?`)) return;
    try {
      const res = await fetch(`/api/medicines/${m.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Medicine deleted.' });
        fetchMedicines();
      } else {
        setMessage({ type: 'error', text: data.message || 'Delete failed' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Delete failed' });
    }
  };

  const set =
    (k: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const inputCls =
    'w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500/60 transition-colors';
  const labelCls = 'block text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mb-1.5';

  return (
    <div className="space-y-7">
      {/* ===== Header ===== */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-teal-400">
            <Pill className="w-5 h-5" />
            <span className="text-[11px] font-black uppercase tracking-[0.22em]">
              CityDoctor Express Pharmacy
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-100 mt-2 tracking-tight">
            Medicine Catalogue CMS
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 max-w-xl leading-relaxed">
            Add, edit and remove medicines. Changes publish instantly to the public{' '}
            <span className="text-teal-300 font-semibold">/shop</span> page rendered from MongoDB.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 text-xs font-black shadow-lg shadow-teal-500/20 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" /> Add Medicine
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

      {/* ===== Toolbar / filters ===== */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                categoryFilter === c
                  ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search medicines..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            />
          </div>
          <button
            onClick={fetchMedicines}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-teal-300 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ===== Stats ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4">
          <div className="text-2xl font-black text-slate-100">{medicines.length}</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">Total Items</div>
        </div>
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4">
          <div className="text-2xl font-black text-teal-300">
            {new Set(medicines.map((m) => m.category)).size}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">Categories</div>
        </div>
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4">
          <div className="text-2xl font-black text-amber-300">
            {medicines.filter((m) => (m.regularPrice || 0) > (m.discountedPrice || 0)).length}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">Discounted Items</div>
        </div>
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4">
          <div className="text-2xl font-black text-emerald-300">
            {medicines.filter((m) => m.isActive).length}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1">Live on Shop</div>
        </div>
      </div>

      {/* ===== Medicine inventory ===== */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center gap-3 text-slate-500 rounded-3xl bg-slate-900/60 border border-slate-800">
          <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
          <p className="text-xs font-semibold">Loading medicine catalogue...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
          <PackageOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No medicines found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {medicines.length === 0
              ? 'Add your first medicine to start selling on the CityDoctor Express Pharmacy.'
              : 'Try a different search or category filter.'}
          </p>
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-950/80 text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3 font-black">Medicine</th>
                  <th className="px-4 py-3 font-black">Category</th>
                  <th className="px-4 py-3 font-black">Manufacturer</th>
                  <th className="px-4 py-3 font-black">Regular</th>
                  <th className="px-4 py-3 font-black">Discounted</th>
                  <th className="px-4 py-3 font-black">Status</th>
                  <th className="px-4 py-3 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((m) => {
                  const onSale = (m.regularPrice || 0) > (m.discountedPrice || 0);
                  const pct =
                    onSale && m.regularPrice
                      ? Math.round((1 - (m.discountedPrice || 0) / m.regularPrice) * 100)
                      : 0;
                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-[200px]">
                          {m.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={m.imageUrl}
                              alt={m.name}
                              className="w-11 h-11 rounded-xl object-cover border border-slate-700 bg-slate-950"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                              <Pill className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-slate-100 text-xs truncate">{m.name}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[220px]">
                              {m.composition || m.form || '—'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-bold whitespace-nowrap">
                          {m.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px] whitespace-nowrap">{m.brand || '—'}</td>
                      <td className="px-4 py-3 text-slate-400 text-[11px] whitespace-nowrap line-through">
                        {bdt(m.regularPrice)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-bold text-emerald-300 text-xs">{bdt(m.discountedPrice)}</span>
                        {onSale && (
                          <span className="ml-2 px-1.5 py-0.5 rounded bg-red-500/10 text-red-300 text-[9px] font-black">
                            {pct}% OFF
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            m.isActive
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                              : 'bg-slate-700/40 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {m.isActive ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(m)}
                            className="p-2 rounded-xl text-slate-400 hover:text-teal-300 hover:bg-teal-500/10 transition-colors"
                            title="Edit medicine"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(m)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete medicine"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== Add / Edit modal ===== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/80 backdrop-blur-sm p-4 md:p-8">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div>
                <h2 className="text-base font-black text-slate-100">
                  {editing ? 'Edit Medicine' : 'Add New Medicine'}
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {editing
                    ? `Updating "${editing.name}"`
                    : 'Create a catalogue item for the public Medicine Shop'}
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
                <label className={labelCls}>Medicine Name *</label>
                <input value={form.name} onChange={set('name')} placeholder="e.g. Napa Extra" className={inputCls} required />
              </div>

              <div>
                <label className={labelCls}>Category *</label>
                <select value={form.category} onChange={set('category')} className={inputCls}>
                  {PRESET_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Form</label>
                <select value={form.form} onChange={set('form')} className={inputCls}>
                  {['Medicine', 'Tablet', 'Capsule', 'Syrup', 'Drops', 'Inhaler', 'Ointment'].map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>Manufacturer / Brand</label>
                <input value={form.brand} onChange={set('brand')} placeholder="e.g. Square Pharma" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Active Ingredient / Composition</label>
                <input
                  value={form.composition}
                  onChange={set('composition')}
                  placeholder="e.g. Paracetamol 500mg + Caffeine 65mg"
                  className={inputCls}
                />
              </div>

              {/* Image: URL or file upload */}
              <div className="sm:col-span-2">
                <label className={labelCls}>Product Image</label>
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 shrink-0 rounded-2xl border border-slate-700 bg-slate-950 overflow-hidden flex items-center justify-center">
                    {form.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Pill className="w-6 h-6 text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      value={form.imageUrl}
                      onChange={set('imageUrl')}
                      placeholder="https://... or /uploads/medicine-xxx.jpg"
                      className={inputCls}
                    />
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      {isUploadingImage ? 'Uploading...' : 'Upload from device'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploadingImage}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) uploadImage(f);
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className={labelCls}>Regular Price (৳)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.regularPrice}
                  onChange={set('regularPrice')}
                  placeholder="e.g. 35"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Discounted Price (৳)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.discountedPrice}
                  onChange={set('discountedPrice')}
                  placeholder="e.g. 30"
                  className={inputCls}
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
                  {editing ? 'Save Changes' : 'Add Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}







