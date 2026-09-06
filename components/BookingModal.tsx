'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Sun, Sunrise, Moon, CalendarDays, Zap, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor?: any | null;
}

/* ------------------------------------------------------------------ */
/*  Time-slot helpers — reflect the doctor's saved Admin settings.     */
/* ------------------------------------------------------------------ */

// Accepts "10:00" / "18:00" (24h) or "10:00 AM" / "01:00 PM" / "2:00PM" (12h).
function parseTimeToMinutes(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = String(value)
    .trim()
    .match(/^(\d{1,2})(?::(\d{2}))?\s*([APap][Mm])?$/);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const meridian = (match[3] || '').toUpperCase();

  if (meridian === 'PM' && hours < 12) hours += 12;
  else if (meridian === 'AM' && hours === 12) hours = 0;
  if (!meridian && hours > 23) return null; // 24h-clock guard
  if (minutes > 59) return null;

  return hours * 60 + minutes;
}

// 615 minutes -> "10:15 AM" (display label used on the grid + checkout URL).
function formatTimeLabel(totalMinutes: number): string {
  const h24 = Math.floor(totalMinutes / 60) % 24;
  const mm = totalMinutes % 60;
  const meridian = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(mm).padStart(2, '0')} ${meridian}`;
}

// Convert a 24-hour "HH:mm" value from an <input type="time"> into the same
// 12-hour label used by the generated grid, e.g. "14:05" -> "2:05 PM".
function format24hTimeLabel(value: string): string {
  const parts = String(value).split(':');
  const hh = parseInt(parts[0], 10);
  const mm = parseInt(parts[1], 10);
  if (Number.isNaN(hh) || Number.isNaN(mm) || mm > 59) return '';
  const h24 = hh % 24;
  const meridian = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(mm).padStart(2, '0')} ${meridian}`;
}

// "Mon, 6 Sep • 10:37 AM" style labels resolved in Asia/Dhaka wall-clock time
// for the CURRENT moment — used by the "Book Now / Immediate Call" shortcut.
function getDhakaNowLabel(): { timeLabel: string; dateLabel: string } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(new Date());
  const read = (type: string) => parts.find((p) => p.type === type)?.value || '';
  return {
    timeLabel: `${read('hour')}:${read('minute')} ${read('dayPeriod')}`,
    dateLabel: `${read('weekday')}, ${read('day')} ${read('month')}`,
  };
}

// Generate every slot whose start time + slotDuration fits inside the shift.
// A shift whose start is AFTER its end (e.g. "09:00 PM" -> "02:00 AM") is an
// overnight shift that crosses midnight: slots run until 24:00, then resume at
// 00:00 until the end time. Labels are returned in 12-hour form, e.g.
// ["09:00 PM", "09:30 PM", ...].
function generateTimeSlots(
  shiftStart?: string | null,
  shiftEnd?: string | null,
  slotDuration?: number | null
): { label: string; minutes: number }[] {
  const start = parseTimeToMinutes(shiftStart);
  const end = parseTimeToMinutes(shiftEnd);
  const step = Math.max(1, Math.round(Number(slotDuration) || 30));
  if (start === null || end === null || start === end) return [];

  const slotMinutes: number[] = [];
  if (end < start) {
    // Overnight shift: evening segment up to midnight, then early-morning
    // segment from 00:00 until the (exclusive) end time.
    for (let t = start; t + step <= 1440; t += step) slotMinutes.push(t);
    for (let t = 0; t + step <= end; t += step) slotMinutes.push(t);
  } else {
    for (let t = start; t + step <= end; t += step) slotMinutes.push(t);
  }

  // Present the day's slots in chronological order for the selected day.
  return slotMinutes
    .sort((a, b) => a - b)
    .map((m) => ({ label: formatTimeLabel(m), minutes: m }));
}

// DB stores days as "Sat, Sun, Mon" (or already an array) -> weekday Set.
function getAvailableDaySet(doctor?: any): Set<string> {
  const raw = doctor?.availableDays;
  const days = Array.isArray(raw)
    ? raw
    : String(raw ?? '')
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean);
  return new Set(days);
}

function shiftPeriodLabel(
  startMinutes: number
): { label: string; Icon: LucideIcon } {
  const hour = Math.floor(startMinutes / 60);
  if (hour < 12) return { label: 'Morning', Icon: Sunrise };
  if (hour < 17) return { label: 'Afternoon', Icon: Sun };
  return { label: 'Evening', Icon: Moon };
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  doctor,
}) => {
  const router = useRouter();
  const { currentUser, openAuthModal } = useAuth();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedDateIdx, setSelectedDateIdx] = useState(0);
  // Flexible-slot testing: free-form 24h value from the custom time picker.
  const [customTime, setCustomTime] = useState('');

  // Calendar row: next 7 days; days NOT in doctor's availableDays flagged.
  const next7Days = useMemo(() => {
    const activeDays = getAvailableDaySet(doctor);
    const days: {
      date: Date;
      dayNum: number;
      dayShort: string;
      formatted: string;
      enabled: boolean;
    }[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayShort = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthShort = d.toLocaleDateString('en-US', { month: 'short' });
      days.push({
        date: d,
        dayNum: d.getDate(),
        dayShort,
        formatted: `${dayShort}, ${d.getDate()} ${monthShort}`,
        enabled: activeDays.has(dayShort),
      });
    }
    return days;
  }, [doctor]);

  // Time grid generated from the doctor's shift + slot settings.
  const timeSlots = useMemo(
    () =>
      generateTimeSlots(
        doctor?.shiftStartTime,
        doctor?.shiftEndTime,
        doctor?.slotDuration
      ),
    [doctor]
  );

  // Reset stale selections whenever the modal opens (or doctor changes).
  useEffect(() => {
    if (!isOpen) return;
    setSelectedDateIdx(0);
    setSelectedSlot(null);
    setCustomTime('');
  }, [isOpen, doctor?.id]);

  const firstEnabledIdx = next7Days.findIndex((d) => d.enabled);
  const activeDateIdx =
    selectedDateIdx >= 0 && next7Days[selectedDateIdx]?.enabled
      ? selectedDateIdx
      : firstEnabledIdx >= 0
        ? firstEnabledIdx
        : 0;
  const activeDay = next7Days[activeDateIdx];
  const hasSelectableDay = firstEnabledIdx >= 0;

  // Grey out slots that already started when today's date is selected.
  // TESTING OVERRIDE — temporarily allow EVERY generated slot for today to be
  // active, clickable & confirmable regardless of the current clock time.
  // Flip ALLOW_PAST_SLOTS_FOR_TESTING to `false` to restore the production
  // rule where already-started ("past") slots of today are greyed out.
  const ALLOW_PAST_SLOTS_FOR_TESTING = true;
  const isToday =
    !ALLOW_PAST_SLOTS_FOR_TESTING &&
    activeDay?.date?.toDateString() === new Date().toDateString();
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  const shiftStartMin = parseTimeToMinutes(doctor?.shiftStartTime);
  const shiftEndMin = parseTimeToMinutes(doctor?.shiftEndTime);
  const period =
    shiftStartMin !== null ? shiftPeriodLabel(shiftStartMin) : null;
  const PeriodIcon = period?.Icon ?? Sun;
  const shiftCaption =
    timeSlots.length > 0 && shiftStartMin !== null && shiftEndMin !== null
      ? `${formatTimeLabel(shiftStartMin)} – ${formatTimeLabel(shiftEndMin)}`
      : '';

  if (!isOpen) return null;

  const goToCheckout = (time: string, date: string) => {
    const params = new URLSearchParams();
    if (doctor?.id) params.set('doctorId', doctor.id);
    params.set('time', time);
    params.set('date', date);
    onClose();
    router.push(`/checkout?${params.toString()}`);
  };

  const requireAuth = (action: () => void) => {
    if (!currentUser) {
      // Intercept booking and open auth modal
      openAuthModal({
        isLoginView: true,
        onAuthSuccess: () => action(),
      });
      return;
    }
    action();
  };

  const handleConfirm = () => {
    if (!selectedSlot || !activeDay?.enabled) return;
    const time = selectedSlot;
    const date = activeDay.formatted;
    requireAuth(() => goToCheckout(time, date));
  };

  // Flexible testing #1 — start a consultation at the CURRENT time (Asia/Dhaka
  // wall clock) with one click, no need to match the doctor's shift grid.
  const handleImmediateBook = () => {
    const { timeLabel, dateLabel } = getDhakaNowLabel();
    requireAuth(() => goToCheckout(timeLabel, dateLabel));
  };

  // Flexible testing #2 — apply an arbitrary custom time from the time picker
  // onto the currently selected date. Works for ANY time today / next 7 days.
  const handleUseCustomTime = () => {
    const time = format24hTimeLabel(customTime);
    if (!time) return;
    setSelectedSlot(time);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-[700px] bg-white rounded-xl p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Available Time Slots
            </h3>
            {doctor?.name && (
              <p className="text-xs text-gray-500 mt-0.5">
                Booking with{' '}
                <span className="font-semibold text-slate-700">
                  {doctor.name}
                </span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Weekly schedule hint from the doctor's Admin settings */}
        <div className="mb-3 flex items-center gap-2 flex-wrap text-[11px] font-medium text-slate-500">
          <CalendarDays className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Available:</span>
          {Array.from(getAvailableDaySet(doctor)).map((d) => (
            <span
              key={d}
              className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-semibold"
            >
              {d}
            </span>
          ))}
        </div>

        {/* FLEXIBLE SLOT TESTING PANEL — book "now" or any custom time */}

        <div className="mb-4 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/70 p-4 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-start gap-2.5 min-w-0">
              <Zap className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-emerald-800">
                  Book Now — Immediate Call
                </p>
                <p className="text-[11px] text-emerald-700/80 leading-snug">
                  Start at the current time instantly. Best for live testing the
                  doctor&apos;s incoming-call queue &amp; consultation room.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleImmediateBook}
              className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors shadow-sm shadow-emerald-600/30 active:scale-95"
            >
              ⚡ Book Immediately
            </button>
          </div>

          <div className="flex items-end gap-2 flex-wrap">
            <div className="flex-1 min-w-[170px]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Or pick any custom time
              </p>
              <input
                type="time"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="w-full rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <button
              type="button"
              onClick={handleUseCustomTime}
              disabled={!customTime}
              className="px-4 py-2 rounded-lg border border-emerald-600 text-emerald-700 bg-white hover:bg-emerald-600 hover:text-white text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Use this time
            </button>
          </div>

          {customTime && (
            <p className="text-[11px] text-slate-600">
              Selected:{' '}
              <span className="font-bold text-slate-800">
                {format24hTimeLabel(customTime) || customTime}
              </span>{' '}
              on{' '}
              <span className="font-bold text-slate-800">
                {activeDay?.formatted}
              </span>{' '}
              — press <span className="font-semibold">Confirm</span> below to
              continue to checkout.
            </p>
          )}
        </div>

        {/* Date Scroll (today + next 7 days; non-working days disabled) */}
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {next7Days.map((day, idx) => {
            const isActive = idx === activeDateIdx && day.enabled;
            const isTodayDate = day.date.toDateString() === new Date().toDateString();
            return (
              <button
                key={`${day.dayShort}-${day.dayNum}`}
                type="button"
                disabled={!day.enabled}
                onClick={() => {
                  if (!day.enabled) return;
                  setSelectedDateIdx(idx);
                  setSelectedSlot(null);
                  setCustomTime('');
                }}
                title={
                  day.enabled
                    ? day.formatted
                    : `${day.formatted} — Doctor not available`
                }
                className={`w-16 h-16 shrink-0 rounded-full border flex flex-col items-center justify-center transition-colors ${
                  !day.enabled
                    ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                    : isActive
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-white border-gray-300 text-gray-500 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <span
                  className={`text-lg font-bold leading-none ${
                    day.enabled ? '' : 'text-gray-300'
                  }`}
                >
                  {day.dayNum}
                </span>
                <span
                  className={`text-[11px] font-medium uppercase mt-0.5 ${
                    isActive
                      ? 'text-blue-100'
                      : day.enabled
                        ? 'text-gray-400'
                        : 'text-gray-300'
                  }`}
                >
                  {isTodayDate ? 'Today' : day.dayShort}
                </span>
              </button>
            );
          })}
        </div>

        {/* Time Grid */}
        <div className="mt-6 flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-slate-900">
            Select your appointment time
          </h4>
          {period && (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-600">
              <PeriodIcon className="w-4 h-4" />
              {period.label}
              {shiftCaption ? ` • ${shiftCaption}` : ''}
            </span>
          )}
        </div>

        {!hasSelectableDay ? (
          <div className="py-10 text-center text-sm text-slate-500 bg-gray-50 rounded-lg border border-gray-200">
            This doctor has no available days within the next 7 days.
          </div>
        ) : timeSlots.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500 bg-gray-50 rounded-lg border border-gray-200">
            No time slots could be generated from this doctor&apos;s shift
            settings.
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {timeSlots.map((slot) => {
              const isPast = isToday && slot.minutes <= nowMinutes;
              const isSelected = selectedSlot === slot.label;
              if (isPast) {
                return (
                  <button
                    key={slot.label}
                    type="button"
                    disabled
                    className="bg-gray-200 text-gray-400 rounded-md py-2 text-sm font-medium cursor-not-allowed"
                  >
                    {slot.label}
                  </button>
                );
              }
              return (
                <button
                  key={slot.label}
                  type="button"
                  onClick={() => {
                    setCustomTime('');
                    setSelectedSlot(slot.label);
                  }}
                  className={`rounded-md py-2 text-sm font-semibold border transition-colors ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-slate-800 hover:border-blue-500 hover:bg-blue-50'
                  }`}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 border-t border-gray-100 pt-4">
          <p className="text-sm font-semibold text-blue-600">
            Appointment Time:{' '}
            {selectedSlot && activeDay?.enabled
              ? `${selectedSlot}, ${activeDay.formatted}`
              : 'Select a time slot'}
          </p>

          <button
            type="button"
            disabled={!selectedSlot || !activeDay?.enabled}
            onClick={handleConfirm}
            className={`mt-4 w-full py-3.5 rounded-lg text-white font-bold text-base transition-colors ${
              selectedSlot && activeDay?.enabled
                ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Confirm
          </button>

          {/* Legend */}
          <div className="mt-5 flex items-center justify-center gap-6 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-white border border-gray-300" />
              Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-gray-200" />
              Not available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-blue-600" />
              Selected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;

