'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Calendar,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';

interface PaymentCheckoutModalProps {
  doctor: any | null;
  isOpen: boolean;
  onClose: () => void;
  patientInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    symptoms?: string;
    scheduledAt?: string;
    slotFormatted?: string;
  };
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  doctor,
  isOpen,
  onClose,
  patientInfo,
}) => {
  const router = useRouter();

  // Tab State: 'bkash' | 'card'
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'card'>('bkash');

  // bKash Form State
  const [bkashNumber, setBkashNumber] = useState('01712345678');
  const [bkashPin, setBkashPin] = useState('');
  const [bkashAgreed, setBkashAgreed] = useState(true);

  // Card Form State
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState(patientInfo?.name || 'John Smith');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');

  // Flow & Simulation States
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !doctor) return null;

  // Taka Consultation Fee
  const bdtFee = Number(doctor.fee || doctor.consultationFee || 350);

  // Format card number with spaces
  const handleCardNumberChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 16);
    const parts = cleaned.match(/[\s\S]{1,4}/g) || [];
    setCardNumber(parts.join(' '));
  };

  // Format expiry MM/YY
  const handleExpiryChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      setCardExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    } else {
      setCardExpiry(cleaned);
    }
  };

  /**
   * Handle Payment Submission & 2-Second Simulation
   */
  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (paymentMethod === 'bkash') {
      if (!bkashNumber || bkashNumber.length < 11) {
        setErrorMessage('Please enter a valid 11-digit bKash account number.');
        return;
      }
      if (!bkashPin || bkashPin.length < 4) {
        setErrorMessage('Please enter your 5-digit bKash PIN.');
        return;
      }
      if (!bkashAgreed) {
        setErrorMessage('You must agree to the merchant terms & conditions.');
        return;
      }
    } else {
      if (!cardNumber || cardNumber.length < 14) {
        setErrorMessage('Please enter a valid 16-digit card number.');
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        setErrorMessage('Please enter card expiry in MM/YY format.');
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        setErrorMessage('Please enter 3-digit CVV code.');
        return;
      }
    }

    // Step 4: Payment Simulation Logic (Disable button & show processing for 2 seconds)
    setIsProcessing(true);

    const generatedTxn = `TXN-${paymentMethod.toUpperCase()}-${Math.floor(
      100000 + Math.random() * 900000
    )}`;

    try {
      // Simulate network request for exactly 2000ms
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Step 5: Save Appointment in SQLite with paymentStatus: "PAID"
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: doctor.id,
          patientName: patientInfo?.name || cardHolder || 'John Smith',
          patientEmail: patientInfo?.email || 'patient@citydoctor.com',
          patientPhone: patientInfo?.phone || bkashNumber || null,
          symptoms: patientInfo?.symptoms || (patientInfo?.slotFormatted ? `Appointment on ${patientInfo.slotFormatted}` : 'Instant Video Consultation'),
          scheduledAt: patientInfo?.scheduledAt || new Date().toISOString(),
          paymentStatus: 'PAID',
          paymentMethod: paymentMethod.toUpperCase(),
          transactionId: generatedTxn,
          amountPaid: bdtFee,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Payment gateway connection error');
      }

      setTransactionId(generatedTxn);
      setPaymentSuccess(true);
      setIsProcessing(false);

      // Auto-redirect to consultation room after brief success celebration
      const targetAppointmentId = data.appointment?.id || doctor.id;
      setTimeout(() => {
        onClose();
        router.push(`/consultation/${targetAppointmentId}`);
      }, 1200);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err.message || 'Payment processing failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                  Secure Checkout
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-bold border border-emerald-500/20">
                  256-Bit SSL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Consultation with {doctor.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SUCCESS TOAST / OVERLAY */}
        {paymentSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="text-xl font-extrabold text-slate-100">
                Payment Successful!
              </h4>
              <p className="text-xs text-emerald-300 mt-1 font-semibold">
                Transaction ID: <span className="font-mono">{transactionId}</span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-2 max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-400">Method:</span>
                <span className="font-bold text-white uppercase">{paymentMethod}</span>
              </div>
              {patientInfo?.slotFormatted && (
                <div className="flex justify-between text-teal-300">
                  <span className="text-slate-400">Appointment Slot:</span>
                  <span className="font-bold">{patientInfo.slotFormatted}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="font-mono font-bold text-teal-300">
                  ৳ {bdtFee.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-emerald-400">PAID & CONFIRMED</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-teal-400 font-semibold animate-pulse pt-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Redirecting to your Consultation Room...</span>
            </div>
          </div>
        ) : (
          /* PAYMENT FORM WORKFLOW */
          <div className="p-4 sm:p-6 space-y-5 overflow-y-auto max-h-[80vh]">
            {/* Fee & Doctor Summary Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-11 h-11 rounded-xl object-cover border border-slate-700"
                />
                <div>
                  <div className="font-bold text-slate-100 text-xs sm:text-sm">
                    {doctor.name}
                  </div>
                  <div className="text-[11px] text-teal-400">{doctor.specialty || doctor.workplace}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Total Fee</div>
                <div className="text-sm sm:text-base font-extrabold font-mono text-slate-100">
                  ৳ {bdtFee.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Scheduled Slot Indicator Banner (if booked via BookingModal) */}
            {patientInfo?.slotFormatted && (
              <div className="p-3 rounded-xl bg-blue-950/50 border border-blue-500/30 text-blue-200 text-xs flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <span className="text-slate-400">Booked Slot: </span>
                  <span className="font-bold text-blue-300">{patientInfo.slotFormatted}</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Payment Method Selection (Toggle Tabs) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Select Payment Method
              </label>

              <div className="grid grid-cols-2 gap-3">
                {/* bKash Tab */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 transition-all text-xs font-bold ${
                    paymentMethod === 'bkash'
                      ? 'bg-[#e2136e]/15 border-[#e2136e] text-[#e2136e] shadow-lg shadow-[#e2136e]/10 ring-1 ring-[#e2136e]/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="w-6 h-6 rounded-lg bg-[#e2136e] flex items-center justify-center text-white font-black text-xs shadow-sm">
                    b
                  </div>
                  <span>bKash Payment</span>
                </button>

                {/* Card Tab */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 transition-all text-xs font-bold ${
                    paymentMethod === 'card'
                      ? 'bg-teal-500/15 border-teal-500 text-teal-300 shadow-lg shadow-teal-500/10 ring-1 ring-teal-500/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-teal-400" />
                  <span>Debit / Credit Card</span>
                </button>
              </div>
            </div>

            {/* 2. bKash Gateway Interface Mockup */}
            {paymentMethod === 'bkash' && (
              <form onSubmit={handleProcessPayment} className="space-y-4 animate-in fade-in duration-200">
                {/* bKash Signature Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-b from-[#e2136e] to-[#c70f5f] text-white shadow-xl space-y-3 relative overflow-hidden">
                  <div className="absolute right-2 -bottom-4 text-white/10 font-black text-7xl select-none pointer-events-none">
                    bKash
                  </div>

                  <div className="flex items-center justify-between border-b border-white/20 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#e2136e] font-black text-sm">
                        b
                      </div>
                      <span className="font-extrabold text-sm tracking-wide">bKash Payment Gateway</span>
                    </div>
                    <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-full">
                      Merchant ID: 01700-CITYDOC
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <div>
                      <div className="text-[10px] text-pink-100 uppercase">Merchant Name</div>
                      <div className="font-bold">CityDoctor Telehealth Ltd</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-pink-100 uppercase">Payable Amount</div>
                      <div className="font-extrabold font-mono text-base">
                        ৳ {bdtFee.toLocaleString()} BDT
                      </div>
                    </div>
                  </div>
                </div>

                {/* bKash Account Number Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>bKash Account Number</span>
                    <span className="text-[11px] text-slate-500">e.g. 01XXXXXXXXX</span>
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e2136e]" />
                    <input
                      type="tel"
                      required
                      placeholder="017XXXXXXXX"
                      maxLength={11}
                      value={bkashNumber}
                      onChange={(e) => setBkashNumber(e.target.value)}
                      disabled={isProcessing}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm placeholder-slate-600 focus:ring-2 focus:ring-[#e2136e] focus:outline-none"
                    />
                  </div>
                </div>

                {/* bKash PIN Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Enter 5-digit bKash PIN</span>
                    <span className="text-[11px] text-slate-500">Encrypted</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      maxLength={5}
                      placeholder="•••••"
                      value={bkashPin}
                      onChange={(e) => setBkashPin(e.target.value)}
                      disabled={isProcessing}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-base tracking-widest placeholder-slate-600 focus:ring-2 focus:ring-[#e2136e] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Agreement Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
                  <input
                    type="checkbox"
                    checked={bkashAgreed}
                    onChange={(e) => setBkashAgreed(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-[#e2136e] focus:ring-[#e2136e]"
                  />
                  <span>I agree to the bKash terms and conditions for doctor consultation</span>
                </label>

                {/* bKash Submit Button with Simulation State */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#e2136e] to-[#b30e56] hover:from-[#d11165] hover:to-[#9e0c4c] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#e2136e]/25 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Confirm Payment ৳ {bdtFee.toLocaleString()}</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 3. Card Payment Interface Mockup */}
            {paymentMethod === 'card' && (
              <form onSubmit={handleProcessPayment} className="space-y-4 animate-in fade-in duration-200">
                {/* Credit Card Visual Mockup */}
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
                  <label className="text-xs font-semibold text-slate-300">
                    Card Number (16 Digits)
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400" />
                    <input
                      type="text"
                      required
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      disabled={isProcessing}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm placeholder-slate-600 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Cardholder Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Cardholder Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Name as printed on card"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    disabled={isProcessing}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs placeholder-slate-600 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                {/* Expiry & CVV */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      required
                      placeholder="12/28"
                      maxLength={5}
                      value={cardExpiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      disabled={isProcessing}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs placeholder-slate-600 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">CVV / CVC</label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      placeholder="•••"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      disabled={isProcessing}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs placeholder-slate-600 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Card Submit Button with Simulation State */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Pay Securely ৳ {bdtFee.toLocaleString()}</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Security Guarantee Note */}
            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Secure Telehealth Payment Guarantee & BMDC Verified</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
