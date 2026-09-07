'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Activity,
  Pill,
  Search,
  ShoppingBag,
  CheckCircle2,
  Truck,
  ShieldCheck,
  PackageSearch,
  Loader2,
  ArrowLeft,
  Zap,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

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
}

const TILE_COLORS = [
  'bg-rose-50 text-rose-500',
  'bg-emerald-50 text-emerald-500',
  'bg-sky-50 text-sky-500',
  'bg-violet-50 text-violet-500',
  'bg-orange-50 text-orange-500',
  'bg-cyan-50 text-cyan-500',
  'bg-lime-50 text-lime-600',
  'bg-amber-50 text-amber-500',
];

export default function ShopPage() {
  const {
    itemCount,
    subtotal,
    savings,
    isOpen: cartIsOpen,
    openCart,
    closeCart,
    addItem: addCartItem,
    increase: increaseCart,
    decrease: decreaseCart,
    getQty,
  } = useCart();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');

  const fetchMedicines = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/medicines');
      const data = await res.json();
      if (data.success && Array.isArray(data.medicines)) {
        setMedicines(data.medicines.filter((m: any) => m.isActive !== false));
      }
    } catch (err) {
      console.error('Failed to load medicines:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [fetchMedicines]);

  const categories = [
    'All',
    ...Array.from(new Set(medicines.map((m) => m.category))),
  ];

  const filtered = medicines
    .filter((m) => (category === 'All' ? true : m.category === category))
    .filter((m) =>
      query.trim()
        ? [m.name, m.brand, m.composition, m.form]
            .join(' ')
            .toLowerCase()
            .includes(query.toLowerCase())
        : true
    );

  const addMedicineToCart = (m: Medicine) => {
    addCartItem({
      id: m.id,
      name: m.name,
      brand: m.brand || '',
      composition: m.composition || '',
      form: m.form || 'Medicine',
      category: m.category || '',
      image: m.imageUrl || '',
      unitPrice: Number(m.discountedPrice || m.regularPrice || 0),
      originalPrice: Number(m.regularPrice || 0),
    });
  };

  const bdt = (n?: number | string | null) =>
    `৳${Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* ===== Sticky header ===== */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-600/25 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <span className="text-[17px] font-extrabold tracking-tight hidden sm:inline">
              City<span className="text-blue-600">Doctor</span>
              <span className="ml-1.5 align-middle text-[8px] font-bold tracking-widest text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-[3px] rounded-md uppercase">
                Shop
              </span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-sm rounded-full px-4 py-1.5">
            <Link href="/department/all" className="text-[13px] font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-full px-3.5 py-1.5 transition-all">
              Find Doctors
            </Link>
            <Link href="/#diagnostic" className="text-[13px] font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-full px-3.5 py-1.5 transition-all">
              Lab Tests
            </Link>
            <Link href="/#health-plans" className="text-[13px] font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50/80 rounded-full px-3.5 py-1.5 transition-all">
              Health Plans
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/patient/appointments"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 text-[12.5px] font-bold transition-colors"
            >
              My Consults &amp; Rx
            </Link>
            <button
              type="button"
              onClick={() => (cartIsOpen ? closeCart() : openCart())}
              className="relative inline-flex items-center gap-2 pl-3 pr-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-colors"
              aria-label="Open cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-white">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 lg:px-6 py-8 lg:py-10">
        {/* ===== Hero ===== */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 px-6 py-9 lg:px-10 lg:py-12 text-white shadow-xl shadow-blue-600/20 mb-8">
          <div className="pointer-events-none absolute -right-16 -top-16 w-72 h-72 bg-white/10 rounded-full blur-2xl" />
          <div className="pointer-events-none absolute -left-10 -bottom-24 w-64 h-64 bg-sky-300/20 rounded-full blur-2xl" />
          <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-extrabold uppercase tracking-widest">
                <Pill className="w-3.5 h-3.5" /> CityDoctor Express Pharmacy
              </span>
              <h1 className="text-[28px] lg:text-[40px] font-black tracking-tight mt-4 leading-tight">
                Genuine Medicines, Delivered in 2–4 Hours
              </h1>
              <p className="text-[13.5px] lg:text-sm text-blue-100 mt-3 max-w-xl leading-relaxed">
                Sourced directly from certified manufacturers like Beximco, Square, Incepta and
                Renata. Flat savings on every item — the catalogue below updates live from the database.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/15 border border-white/20 text-[11.5px] font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-200" /> 100% Genuine
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/15 border border-white/20 text-[11.5px] font-bold">
                <Truck className="w-4 h-4 text-amber-200" /> Free over ৳500
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/15 border border-white/20 text-[11.5px] font-bold">
                <Zap className="w-4 h-4 text-cyan-200" /> Code: CITYDOCTOR10
              </span>
            </div>
          </div>
        </section>

        {/* ===== Catalogue controls ===== */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-full text-[12px] font-bold border transition-all ${
                  category === c
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, brand or composition..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white border border-slate-200 text-[13px] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 shadow-sm"
            />
          </div>
        </div>

        {/* ===== Catalogue ===== */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-500 rounded-3xl bg-white border border-slate-200">
            <Loader2 className="w-9 h-9 animate-spin text-blue-600" />
            <p className="text-xs font-semibold">Loading medicines from the database...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-500 rounded-3xl bg-white border border-slate-200">
            <PackageSearch className="w-12 h-12 text-slate-300" />
            <p className="text-base font-bold text-slate-900">No medicines found</p>
            <p className="text-xs text-slate-500 max-w-sm text-center">
              {medicines.length === 0
                ? 'The pharmacy catalogue is empty. Admin can add medicines from the Medicine CMS.'
                : 'Try a different search or category.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
            {filtered.map((m, idx) => {
              const onSale = Number(m.regularPrice || 0) > Number(m.discountedPrice || 0);
              const qty = getQty(m.id);
              const tile = TILE_COLORS[idx % TILE_COLORS.length];
              return (
                <div
                  key={m.id}
                  className="group relative bg-white rounded-3xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-xl hover:-translate-y-0.5 hover:border-blue-200 transition-all duration-300"
                >
                  {onSale && m.regularPrice > 0 && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-red-50 text-red-500 text-[10px] font-extrabold border border-red-100 z-10">
                      {Math.round((1 - (m.discountedPrice || 0) / m.regularPrice) * 100)}% OFF
                    </span>
                  )}
                  {m.imageUrl ? (
                    <div className="relative h-24 rounded-2xl overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.imageUrl}
                        alt={m.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className={`relative h-24 rounded-2xl ${tile} flex items-center justify-center overflow-hidden`}>
                      <span className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.9),transparent_50%)]" />
                      <Pill className="w-10 h-10 rotate-[-35deg]" strokeWidth={1.6} />
                      <span className="absolute bottom-2 left-2 text-[10px] font-extrabold uppercase tracking-wide opacity-70">
                        {m.category}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col gap-1 min-w-0">
                    <h3 className="text-[15px] font-extrabold text-slate-900 truncate">{m.name}</h3>
                    <p className="text-[11.5px] text-slate-500 leading-snug truncate">
                      {m.composition || '—'}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10.5px] text-slate-400 font-semibold truncate">
                        {m.brand || 'CityDoctor Pharma'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[9.5px] font-bold text-slate-500 uppercase shrink-0">
                        {m.form}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[17px] font-extrabold text-slate-900">
                        {bdt(m.discountedPrice || m.regularPrice)}
                      </span>
                      {onSale && (
                        <span className="text-[11.5px] text-slate-400 line-through font-semibold">
                          {bdt(m.regularPrice)}
                        </span>
                      )}
                    </div>
                    {qty === 0 ? (
                      <button
                        type="button"
                        onClick={() => addMedicineToCart(m)}
                        className="px-3 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[11.5px] font-extrabold transition-all active:scale-95 shadow-sm shadow-blue-600/20"
                      >
                        + Add
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-1 py-0.5">
                        <button
                          type="button"
                          onClick={() => decreaseCart(m.id)}
                          className="w-6 h-6 rounded-full bg-white text-emerald-600 font-black text-sm border border-emerald-100 hover:bg-emerald-100 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-[12px] font-black text-emerald-700">{qty}</span>
                        <button
                          type="button"
                          onClick={() => increaseCart(m.id)}
                          className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-sm hover:bg-emerald-700 transition-colors"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ===== Cart summary CTA ===== */}
        {itemCount > 0 && (
          <section className="mt-8 sticky bottom-4 z-30 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-900/5 p-4 lg:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-slate-900 text-[15px]">
                  {itemCount} item{itemCount > 1 ? 's' : ''} ready for checkout
                </h2>
                <p className="text-[11.5px] text-slate-500 mt-0.5">
                  Total <span className="font-black text-slate-900">{bdt(subtotal)}</span>
                  {savings > 0 && (
                    <>
                      {' '}· <span className="font-bold text-emerald-600">You save {bdt(savings)}</span>
                    </>
                  )}
                  {' '}· Free delivery over ৳500
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={openCart}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-black shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] shrink-0"
            >
              View Cart &amp; Checkout
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </section>
        )}

        {/* ===== Trust band + back ===== */}
        <section className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl bg-white border border-slate-200/80 px-6 py-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11.5px] font-bold text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% Genuine Guaranteed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-blue-600" /> Delivery in 2–4 hours
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" /> Licensed pharmacist verification
            </span>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[13px] font-extrabold text-blue-600 hover:text-blue-700 transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Homepage
          </Link>
        </section>
      </main>
    </div>
  );
}




