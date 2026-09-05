'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Lock,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  User,
  CalendarDays,
} from 'lucide-react';

interface CardGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: any | null;
  patient: any | null;
  timeSlot: string;
  amount: number;
}

export const CardGatewayModal: React.FC<CardGatewayModalProps> = ({
  isOpen,
  onClose,
  doctor,
  patient,
  timeSlot,
  amount,
}) => {
  const router = useRouter();

  // Standard card inputs: Card Number, Expiry, CVV, Cardholder Name
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(patient?.name || '');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  if (!isOpen || !doctor) return null;

  // Format card number in groups of 4
  const handleCardNumberChange = (val: string) => {
    const cleaned = val.replace(/[^\d]/g, '').slice(0, 16);
    const parts = cleaned.match(/[\s\S]{1,4}/g) || [];
    setCardNumber(parts.join(' '));
    setErrorMessage(null);
  };

  // Format expiry MM/YY
  const handleExpiryChange = (val: string) => {
    const cleaned = val.replace(/[^\d]/g, '').slice(0, 4);
    setCardExpiry(cleaned.length >= 3 ? `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}` : cleaned);
    setErrorMessage(null);
  };

  const handleCvvChange = (val: string) => {
    setCardCvv(val.replace(/[^\d]/g, '').slice(0, 4));
    setErrorMessage(null);
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!cardHolder.trim()) {
      setErrorMessage('Please enter the cardholder name.');
      return;
    }
    if (cardNumber.replace(/\s/g, '').length < 15) {
      setErrorMessage('Please enter a valid 16-digit card number.');
      return;
    }
    if (cardExpiry.length < 5) {
      setErrorMessage('Please enter card expiry in MM/YY format.');
      return;
    }
    if (cardCvv.length < 3) {
      setErrorMessage('Please enter a valid 3-digit CVV.');
      return;
    }

    setIsProcessing(true);
    const generatedTxn = `CARD-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // Simulate the card processor response delay (~2 seconds)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Sync the confirmed PAID booking into the database for the Admin panel
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient?.id,
          doctorId: doctor.id,
          timeSlot,
          paymentStatus: 'PAID',
          paymentMethod: 'CARD',
          transactionId: generatedTxn,
          amountPaid: amount,
          patientName: patient?.name,
          patientPhone: patient?.phone,
          patientLocation: patient?.location,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Card gateway could not confirm the payment.');
      }

      setTransactionId(generatedTxn);
      setIsSuccess(true);
      setIsProcessing(false);

      // Redirect to the Payment Successful page
      const targetAppointmentId = data.appointment?.id || '';
      setTimeout(() => {
        const params = new URLSearchParams({
          appointmentId: targetAppointmentId,
          method: 'card',
          amount: String(amount),
        });
        if (doctor?.id) params.set('doctorId', doctor.id);
        router.push(`/payment-success?${params.toString()}`);
      }, 1200);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err.message || 'Payment processing failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Card Modal Container */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700 rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base leading-tight">Card Payment Gateway</h3>
              <p className="text-[11px] text-slate-400">Visa • Mastercard • Amex</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SUCCESS STATE */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-extrabold text-slate-100">Payment Successful!</h4>
            <p className="text-xs font-semibold text-emerald-400">
              Transaction ID: <span className="font-mono">{transactionId}</span>
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-teal-400 font-semibold animate-pulse pt-1">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Redirecting to Payment Success page...</span>
            </div>
          </div>
        ) : (
          /* PAYMENT FORM */
          <div className="p-5 sm:p-6 space-y-4">
            {/* Amount summary */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-11 h-11 rounded-xl object-cover border border-slate-700"
                />
                <div>
                  <div className="font-bold text-slate-100 text-xs sm:text-sm">{doctor.name}</div>
                  <div className="text-[11px] text-teal-400">{doctor.specialty || doctor.workplace}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Payable</div>
                <div className="font-extrabold font-mono text-lg text-teal-400">
                  ৳ {amount.toLocaleString()}
                </div>
              </div>
            </div>


            <form onSubmit={handleConfirmPayment} className="space-y-3.5">
              {/* Card visual mockup */}
              <div className="p-5 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-teal-950 border border-teal-500/40 text-slate-100 shadow-xl space-y-4 relative">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-7 rounded-md bg-gradient-to-r from-amber-300 to-amber-500 shadow-sm" />
                  <div className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                    <span className="text-teal-400">VISA</span> /{' '}
                    <span className="text-rose-400">Mastercard</span>
                  </div>
                </div>

                <div className="font-mono text-base tracking-widest text-slate-100">
                  {cardNumber || '•••• •••• •••• ••••'}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <div className="text-[9px] uppercase text-slate-500">Cardholder</div>
                    <div className="font-semibold text-slate-200 truncate max-w-[180px]">
                      {cardHolder || 'Cardholder Name'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] uppercase text-slate-500">Expires</div>
                    <div className="font-mono font-semibold text-slate-200">
                      {cardExpiry || 'MM/YY'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400" />
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    disabled={isProcessing}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm placeholder-slate-600 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Cardholder Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Cardholder Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400" />
                  <input
                    type="text"
                    required
                    placeholder="Name as printed on card"
                    value={cardHolder}
                    onChange={(e) => {
                      setCardHolder(e.target.value);
                      setErrorMessage(null);
                    }}
                    disabled={isProcessing}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm placeholder-slate-600 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>


              {/* Expiry & CVV */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Expiry (MM/YY)</label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400" />
                    <input
                      type="text"
                      required
                      placeholder="12/28"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      disabled={isProcessing}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm placeholder-slate-600 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">CVV / CVC</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400" />
                    <input
                      type="password"
                      required
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="•••"
                      value={cardCvv}
                      onChange={(e) => handleCvvChange(e.target.value)}
                      disabled={isProcessing}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm placeholder-slate-600 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 mt-[1px] shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Confirm Payment Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Card Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Confirm Payment ৳ {amount.toLocaleString()}</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Secured by PCI-DSS • 256-bit SSL Encryption</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardGatewayModal;

