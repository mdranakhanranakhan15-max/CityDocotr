'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  ImageIcon,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  Sparkles,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

interface HeroBanner {
  id: string;
  title: string | null;
  subtitle: string | null;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [imageUrl, setImageUrl] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/banners?all=true');
      const data = await res.json();
      if (data.success) {
        setBanners(data.banners);
      }
    } catch (err) {
      console.error('Error loading banners:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          title: title || '1800+ Specialist And Experienced Doctors From Reputed Hospitals',
          subtitle: subtitle || 'Get instant online video consultations anytime, anywhere with BMDC certified physicians.',
          isActive,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: 'Hero banner added successfully!' });
        setImageUrl('');
        setTitle('');
        setSubtitle('');
        setIsActive(true);
        fetchBanners();
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Failed to add banner' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (banner: HeroBanner) => {
    try {
      const res = await fetch(`/api/banners/${banner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setBanners((prev) =>
          prev.map((b) => (b.id === banner.id ? { ...b, isActive: !b.isActive } : b))
        );
      }
    } catch (err) {
      console.error('Error toggling banner status:', err);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hero banner?')) return;

    try {
      const res = await fetch(`/api/banners/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setBanners((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error('Error deleting banner:', err);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-widest">
            <ImageIcon className="w-4 h-4" />
            <span>Landing Page Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
            Dynamic Hero Banners
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Upload and manage the rotating hero banners displayed on the CityDoctor homepage carousel.
          </p>
        </div>

        <button
          onClick={fetchBanners}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 self-start sm:self-auto border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Add New Banner Form Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <Plus className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-100">Add New Hero Banner</h2>
          </div>
        </div>

        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleAddBanner} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">
                Image URL <span className="text-rose-400">*</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/photo-..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Headline Title</label>
              <input
                type="text"
                placeholder="e.g. 1800+ Specialist And Experienced Doctors..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Subtitle Description</label>
            <input
              type="text"
              placeholder="e.g. Get instant online video consultations anytime, anywhere with BMDC certified physicians."
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 bg-slate-950 border-slate-800"
              />
              <span className="font-semibold text-slate-300">Publish to Carousel immediately (Active)</span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting || !imageUrl}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Adding Banner...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add Banner</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Existing Banners Grid / Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-100">
            Active Hero Banners ({banners.length})
          </h2>
          <span className="text-xs text-slate-400">Auto-rotated on the homepage</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-teal-400 mx-auto" />
            <p className="text-xs text-slate-400">Loading banners from database...</p>
          </div>
        ) : banners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg flex flex-col justify-between group hover:border-slate-700 transition-colors"
              >
                <div>
                  {/* Image Preview */}
                  <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title || 'Hero Banner'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow ${
                          banner.isActive
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {banner.isActive ? 'Active' : 'Draft'}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4 space-y-2 text-xs">
                    <h3 className="font-bold text-slate-100 line-clamp-2">
                      {banner.title || 'Untitled Banner'}
                    </h3>
                    <p className="text-slate-400 text-[11px] line-clamp-2">
                      {banner.subtitle || 'No subtitle provided'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 pt-0 border-t border-slate-800/80 mt-2 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleActive(banner)}
                    className="text-xs font-semibold text-slate-400 hover:text-teal-300 transition-colors"
                  >
                    {banner.isActive ? 'Deactivate' : 'Activate'}
                  </button>

                  <button
                    onClick={() => handleDeleteBanner(banner.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
            <ImageIcon className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No banners found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your first hero banner above to display high-quality visual carousels on the homepage.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

