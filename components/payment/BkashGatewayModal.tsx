'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Lock,
  Smartphone,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';

interface BkashGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: any | null;
  patient: any | null;
  timeSlot: string;
  amount: number;
}

export const BkashGatewayModal: React.FC<BkashGatewayModalProps> = ({
  isOpen,
  onClose,
  doctor,
  patient,
  timeSlot,
  amount,
}) => {
  const router = useRouter();

  // Official bKash flow inputs: Account Number -> OTP -> PIN
  const [accountNumber, setAccountNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  if (!isOpen || !doctor) return null;

  const handleAccountChange = (val: string) => {
    setAccountNumber(val.replace(/[^\d]/g, '').slice(0, 11));
    setErrorMessage(null);
  };

  const handleOtpChange = (val: string) => {
    setOtp(val.replace(/[^\d]/g, '').slice(0, 6));
    setErrorMessage(null);
  };

  const handlePinChange = (val: string) => {
    setPin(val.replace(/[^\d]/g, '').slice(0, 5));
    setErrorMessage(null);
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (accountNumber.length < 11) {
      setErrorMessage('Please enter a valid 11-digit bKash Account Number.');
      return;
    }
    if (otp.length < 4) {
      setErrorMessage('Please enter the OTP sent to your bKash number.');
      return;
    }
    if (pin.length < 4) {
      setErrorMessage('Please enter your 5-digit bKash PIN.');
      return;
    }

    setIsProcessing(true);
    const generatedTxn = `BKASH-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // Simulate the bKash gateway response delay (~2 seconds)
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
          paymentMethod: 'BKASH',
          transactionId: generatedTxn,
          amountPaid: amount,
          patientName: patient?.name,
          patientPhone: patient?.phone,
          patientLocation: patient?.location,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'bKash gateway could not confirm the payment.');
      }

      setTransactionId(generatedTxn);
      setIsSuccess(true);
      setIsProcessing(false);

      // Redirect to the Payment Successful page
      const targetAppointmentId = data.appointment?.id || '';
      setTimeout(() => {
        const params = new URLSearchParams({
          appointmentId: targetAppointmentId,
          method: 'bkash',
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

      {/* bKash Modal Container - official pink theme */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#fdf2f7] to-[#fdeaf2] border-2 border-[#e2136e]/30 rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header - bKash pink gradient */}
        <div className="p-5 border-b border-[#e2136e]/20 bg-gradient-to-r from-[#e2136e] to-[#b30e56]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-md">
                <span className="text-[#e2136e] font-black text-lg leading-none">b</span>
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base leading-tight">
                  bKash Payment Gateway
                </h3>
                <p className="text-[11px] text-pink-100 font-medium">
                  CityDoctor Telehealth Ltd • Merchant: 01700-CITYDOC
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SUCCESS STATE */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 border-2 border-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-extrabold text-[#b30e56]">Payment Successful!</h4>
            <p className="text-xs font-semibold text-emerald-600">
              Transaction ID: <span className="font-mono">{transactionId}</span>
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-[#e2136e] font-semibold animate-pulse pt-1">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Redirecting to Payment Success page...</span>
            </div>
          </div>
        ) : (
          /* PAYMENT FORM */
          <div className="p-5 sm:p-6 space-y-4">
            {/* Amount summary */}
            <div className="p-4 rounded-2xl bg-white border border-[#e2136e]/20 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-11 h-11 rounded-xl object-cover border border-[#e2136e]/20"
                />
                <div>
                  <div className="font-bold text-slate-800 text-xs sm:text-sm">{doctor.name}</div>
                  <div className="text-[11px] text-[#e2136e]">{doctor.specialty || doctor.workplace}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Payable</div>
                <div className="font-extrabold font-mono text-lg text-[#e2136e]">
                  ৳ {amount.toLocaleString()}
                </div>
              </div>
            </div>


            <form onSubmit={handleConfirmPayment} className="space-y-3.5">
              {/* Account Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>bKash Account Number</span>
                  <span className="text-[10px] text-slate-400 font-medium">e.g. 01XXXXXXXXX</span>
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e2136e]" />
                  <input
                    type="tel"
                    required
                    inputMode="numeric"
                    placeholder="017XXXXXXXX"
                    value={accountNumber}
                    onChange={(e) => handleAccountChange(e.target.value)}
                    disabled={isProcessing}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#e2136e]/30 text-slate-800 font-mono text-sm placeholder-slate-400 focus:ring-2 focus:ring-[#e2136e] focus:outline-none"
                  />
                </div>
              </div>

              {/* OTP */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>One-Time Password (OTP)</span>
                  <span className="text-[10px] text-emerald-600 font-semibold animate-pulse">
                    Sent via SMS
                  </span>
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e2136e]" />
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    placeholder="6-digit OTP"
                    value={otp}
                    onChange={(e) => handleOtpChange(e.target.value)}
                    disabled={isProcessing}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#e2136e]/30 text-slate-800 font-mono text-sm placeholder-slate-400 focus:ring-2 focus:ring-[#e2136e] focus:outline-none"
                  />
                </div>
              </div>

              {/* PIN */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Enter 5-digit bKash PIN</span>
                  <span className="text-[10px] text-slate-400 font-medium">Encrypted</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e2136e]" />
                  <input
                    type="password"
                    required
                    inputMode="numeric"
                    maxLength={5}
                    placeholder="•••••"
                    value={pin}
                    onChange={(e) => handlePinChange(e.target.value)}
                    disabled={isProcessing}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#e2136e]/30 text-slate-800 font-mono text-base tracking-widest placeholder-slate-400 focus:ring-2 focus:ring-[#e2136e] focus:outline-none"
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 mt-[1px] shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Confirm Payment Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#e2136e] to-[#b30e56] hover:from-[#d11165] hover:to-[#9e0c4c] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#e2136e]/30 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Contacting bKash...</span>
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
                <span>Secured by bKash • 100% SSL Encrypted</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default BkashGatewayModal;

