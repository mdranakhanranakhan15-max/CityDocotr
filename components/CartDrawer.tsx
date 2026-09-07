'use client';

import React, { useEffect, useState } from 'react';
import {
  ShoppingBag,
  X,
  Minus,
  Plus,
  Trash2,
  Pill,
  ShieldCheck,
  CheckCircle2,
  Truck,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

const bdt = (n?: number) =>
  `৳${Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

/**
 * Slide-over purchase drawer shown by the Navbar cart icon and automatically
 * whenever a medicine is added ("+ Add") from the home grid or the /shop page.
 * Lists every item with price + quantity steppers, a savings summary and a
 * Proceed-to-Checkout / Place Order action.
 */
export const CartDrawer: React.FC = () => {
  const {
    items,
    itemCount,
    subtotal,
    savings,
    originalTotal,
    isOpen,
    closeCart,
    increase,
    decrease,
    removeItem,
    clearCart,
  } = useCart();

  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState<string | null>(null);

  // Close with the Escape key + lock body scroll while the drawer is open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, closeCart]);

  // Reset the internal flow state each time the drawer opens.
  useEffect(() => {
    if (isOpen) {
      setPlacing(false);
      setPlaced(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePlaceOrder = async () => {
    setPlacing(true);
    // Simulated gateway hand-off — swap with the real order API when wired up.
    await new Promise((resolve) => setTimeout(resolve, 900));
    const orderId = `CD${Date.now().toString().slice(-8)}`;
    setPlaced(orderId);
    setPlacing(false);
    clearCart();
  };

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Medicine cart">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"
        onClick={closeCart}
      />
      {/* Drawer panel */}
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <ShoppingBag className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-[15px] font-black text-slate-900 leading-none">Your Cart</h2>
              <p className="text-[11px] text-slate-500 mt-1 font-semibold">
                {itemCount} item{itemCount !== 1 ? 's' : ''} · CityDoctor Express Pharmacy
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {placed ? (
          /* ====== ORDER PLACED SUCCESS ====== */
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Order Placed!</h3>
              <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">
                Thank you for shopping with CityDoctor. Our licensed pharmacist will call you
                shortly to confirm delivery.
              </p>
            </div>
            <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Order Reference
              </span>
              <p className="text-[15px] font-black text-blue-700 mt-0.5 font-mono">{placed}</p>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="mt-1 w-full py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-black shadow-lg shadow-blue-600/20 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : items.length === 0 ? (
          /* ====== EMPTY CART ====== */
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center overflow-y-auto">
            <div className="w-20 h-20 rounded-3xl bg-slate-100 text-slate-300 flex items-center justify-center">
              <ShoppingBag className="w-9 h-9" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Your cart is empty</h3>
              <p className="text-[12.5px] text-slate-500 mt-1.5 leading-relaxed">
                Add medicines from the CityDoctor shop and they will appear here ready for checkout.
              </p>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="mt-1 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-black shadow-lg shadow-blue-600/20 transition-colors"
            >
              Browse Medicines
            </button>
          </div>
        ) : (
          <>
            {/* ====== ITEMS LIST ====== */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {items.map((item) => {
                const onSale = (item.originalPrice || 0) > item.unitPrice;
                return (
                  <div
                    key={item.id}
                    className="flex gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm"
                  >
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-contain border border-slate-100 bg-slate-50 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Pill className="w-6 h-6" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-[13px] font-bold text-slate-900 truncate">
                            {item.name}
                          </h4>
                          <p className="text-[10.5px] text-slate-500 truncate mt-0.5">
                            {item.brand || item.category || item.form || 'Medicine'}
                            {item.composition ? ` · ${item.composition}` : ''}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[14px] font-black text-slate-900">
                            {bdt(item.unitPrice)}
                          </span>
                          {onSale && (
                            <span className="text-[10.5px] text-slate-400 line-through font-semibold">
                              {bdt(item.originalPrice)}
                            </span>
                          )}
                        </div>

                        {/* Quantity stepper */}
                        <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-1 py-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => decrease(item.id)}
                            className="w-6 h-6 rounded-full bg-white text-slate-600 font-black border border-slate-200 hover:bg-blue-50 transition-colors flex items-center justify-center"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-[12.5px] font-black text-slate-800">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => increase(item.id)}
                            className="w-6 h-6 rounded-full bg-blue-600 text-white font-black hover:bg-blue-700 transition-colors flex items-center justify-center"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={clearCart}
                className="w-full text-center text-[11px] font-bold text-slate-400 hover:text-rose-500 transition-colors pt-1"
              >
                Clear Cart
              </button>
            </div>

            {/* ====== SUMMARY / CHECKOUT ====== */}
            <div className="border-t border-slate-200 px-5 py-4 bg-slate-50/80 space-y-3 shrink-0">
              <div className="space-y-1.5 text-[12.5px]">
                <div className="flex items-center justify-between text-slate-500 font-semibold">
                  <span>Subtotal ({itemCount} items)</span>
                  <span className="text-slate-800 font-bold">{bdt(subtotal)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 font-bold">
                    <span>CityDoctor savings</span>
                    <span>− {bdt(savings)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-slate-400">
                  <span>Delivery fee</span>
                  <span>
                    {subtotal >= 500 ? (
                      <span className="text-emerald-600 font-bold">FREE</span>
                    ) : (
                      bdt(50)
                    )}
                  </span>
                </div>
                {originalTotal > subtotal && (
                  <div className="flex items-center justify-between text-slate-400 line-through text-[11.5px]">
                    <span>Regular total</span>
                    <span>{bdt(originalTotal)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-[13px] font-black text-slate-900">Total</span>
                  <span className="text-[19px] font-black text-slate-900">
                    {bdt(subtotal + (subtotal >= 500 ? 0 : 50))}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-[13.5px] font-black shadow-lg shadow-blue-600/25 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {placing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing Payment...
                  </>
                ) : (
                  <>
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 font-bold">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secure Payment
                </span>
                <span className="inline-flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-blue-600" /> 2–4 hr delivery
                </span>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
};

export default CartDrawer;



