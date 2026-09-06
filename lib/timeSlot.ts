/**
 * Bangladesh Standard Time (Asia/Dhaka) — fixed UTC+6 offset, no daylight
 * saving. All human-readable appointment slots ("Mon, 1 Sep • 2:00 PM") are
 * Dhaka wall-clock times, so they are normalised to this offset regardless of
 * which timezone the server process runs in. This keeps booked appointments on
 * the correct day in the doctor's queue no matter where the app is hosted.
 */
export const DHAKA_UTC_OFFSET_MS = 6 * 60 * 60 * 1000;

/** Wall-clock date (year/month/day) of `date` inside Asia/Dhaka. */
function dhakaDateParts(date: Date): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);
  const read = (type: string) => Number(parts.find((p) => p.type === type)?.value || 0);
  return { year: read('year'), month: read('month'), day: read('day') };
}

/** Start of today's Asia/Dhaka calendar day as an absolute UTC instant. */
export function startOfTodayDhaka(now: Date = new Date()): Date {
  const { year, month, day } = dhakaDateParts(now);
  return new Date(Date.UTC(year, month - 1, day) - DHAKA_UTC_OFFSET_MS);
}

/** Start of tomorrow's Asia/Dhaka calendar day as an absolute UTC instant. */
export function endOfTodayDhaka(now: Date = new Date()): Date {
  return new Date(startOfTodayDhaka(now).getTime() + 24 * 60 * 60 * 1000);
}

/** Minutes since midnight of the Dhaka wall-clock time for `date`. */
export function dhakaMinutesOfDay(date: Date | string): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  const wall = new Date(d.getTime() + DHAKA_UTC_OFFSET_MS);
  return (wall.getUTCHours() * 60 + wall.getUTCMinutes()) % 1440;
}

/**
 * Convert a human-readable time slot into a real Date so the doctor dashboard
 * can enforce the "join 5 minutes before the scheduled time" rule.
 *
 * Accepted formats (produced by BookingModal / checkout):
 *   - "Mon, 1 Sep • 2:00 PM"
 *   - "Mon, 1 Sep 2026 • 2:00 PM"
 *   - "2:00 PM"
 *   - ISO date string
 *
 * Slots are interpreted as Asia/Dhaka wall-clock time (UTC+6), not server-local
 * time, so bookings land on the correct day/hour in every deployment.
 */
export function parseTimeSlotToDate(timeSlot: string | null | undefined): Date | null {
  if (!timeSlot) return null;

  // Already an ISO/valid date? Use it directly.
  const asDate = new Date(timeSlot);
  if (!Number.isNaN(asDate.getTime()) && timeSlot.includes('T')) {
    return asDate;
  }

  const cleaned = timeSlot.replace('•', ' ').replace(/[,\u2022]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned) return null;

  // Extract the clock portion, e.g. "2:00 PM"
  const timeMatch = cleaned.match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/i);
  if (!timeMatch) return null;

  let hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const meridiem = (timeMatch[3] || '').toUpperCase();

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  const now = new Date();
  const todayDhaka = dhakaDateParts(now);
  let year = todayDhaka.year;

  // Optional explicit year, e.g. "Mon, 1 Sep 2026"
  const yearMatch = cleaned.match(/(20\d{2})/);
  if (yearMatch) year = Number(yearMatch[1]);

  const months: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };

  let month: number | undefined;
  let day: number | undefined;

  // Format A: "Mon, 1 Sep" (weekday, day, month)
  const matchA = cleaned.match(/([A-Za-z]{3})\s+(\d{1,2})\s+([A-Za-z]{3})/);
  if (matchA) {
    day = Number(matchA[2]);
    month = months[matchA[3].toLowerCase()];
  } else {
    // Format B: "Tue, Sep 1" (weekday, month, day)
    const matchB = cleaned.match(/([A-Za-z]{3})\s+([A-Za-z]{3})\s+(\d{1,2})/);
    if (matchB) {
      month = months[matchB[2].toLowerCase()];
      day = Number(matchB[3]);
    }
  }

  // Build the slot as an Asia/Dhaka wall-clock instant (timezone independent).
  let result: Date;
  if (month === undefined || day === undefined) {
    // Time-only slot: use today's Dhaka date.
    result = new Date(
      Date.UTC(todayDhaka.year, todayDhaka.month - 1, todayDhaka.day, hours, minutes, 0, 0) -
        DHAKA_UTC_OFFSET_MS
    );
  } else {
    result = new Date(Date.UTC(year, month, day, hours, minutes, 0, 0) - DHAKA_UTC_OFFSET_MS);
  }

  if (Number.isNaN(result.getTime())) return null;
  return result;
}

/* ------------------------------------------------------------------ */
/*  Shared time-slot math used by the booking APIs & BookingModal.     */
/* ------------------------------------------------------------------ */

// Weekday abbreviations in the same format saved by the Admin panel.
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Split "Sat, Sun, Mon" (or an array) into a normalized weekday array.
export function parseAvailableDays(value?: string | string[] | null): string[] {
  if (Array.isArray(value)) {
    return value.map((d) => String(d).trim()).filter(Boolean);
  }
  if (!value) return [];
  return String(value)
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean);
}

// Parse "10:00" (24h) or "10:00 AM" / "01:00 PM" (12h) -> minutes since midnight.
export function parseTimeToMinutes(value?: string | null): number | null {
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

// Enumerate the start minutes of every bookable slot inside a doctor's shift.
// A shift whose start is AFTER its end (e.g. "09:00 PM" -> "02:00 AM") is an
// overnight shift that crosses midnight: slots run until 24:00, then resume at
// 00:00 until the end time. All returned minutes are normalised to the 0..1439
// range so callers can compare them against wall-clock minutes of any day.
export function buildSlotStartMinutes(doctor: any): number[] {
  const start = parseTimeToMinutes(doctor?.shiftStartTime);
  const end = parseTimeToMinutes(doctor?.shiftEndTime);
  const step = Math.max(1, Math.round(Number(doctor?.slotDuration) || 15));
  if (start === null || end === null || start === end) return [];

  const minutes: number[] = [];
  if (end < start) {
    // Overnight shift: evening segment up to midnight, then early-morning
    // segment from 00:00 until the (exclusive) end time.
    for (let t = start; t + step <= 1440; t += step) minutes.push(t);
    for (let t = 0; t + step <= end; t += step) minutes.push(t);
  } else {
    for (let t = start; t + step <= end; t += step) minutes.push(t);
  }
  // Present the day's slots in chronological (0..1439) order.
  return minutes.sort((a, b) => a - b);
}

/**
 * Validate a requested appointment time against the doctor's saved weekly
 * schedule (availableDays + shift window + slotDuration).
 */
export function isValidDoctorScheduleSlot(
  doctor: any,
  when: Date | null | undefined
): boolean {
  if (!doctor || !when || Number.isNaN(when.getTime())) return false;

  // Evaluate the requested instant against the doctor's schedule in Asia/Dhaka
  // wall-clock terms (the same timezone slot strings are interpreted in).
  const wall = new Date(when.getTime() + DHAKA_UTC_OFFSET_MS);
  if (!parseAvailableDays(doctor.availableDays).includes(WEEKDAY_SHORT[wall.getUTCDay()])) {
    return false;
  }

  const slotStartMinutes = buildSlotStartMinutes(doctor);
  const requestedMinutes = wall.getUTCHours() * 60 + wall.getUTCMinutes();
  return slotStartMinutes.includes(requestedMinutes);
}

/* ------------------------------------------------------------------ */
/*  Consultation call window (patient may initiate/join a call).       */
/*  STANDARDISED slot/timeout rules shared by the patient appointment  */
/*  list, the doctor dashboard and the video room:                     */
/*    opensAt  = scheduled slot − 5 minutes  (join lead-in)            */
/*    closesAt = scheduled slot + 15 minutes (fixed session timeout,   */
/*               independent of the doctor's slotDuration setting)     */
/* ------------------------------------------------------------------ */

export const CONSULTATION_JOIN_LEAD_MS = 5 * 60 * 1000; // 5 minutes before slot

/** Standardised number of minutes the room stays open AFTER the slot. */
export const CONSULTATION_WINDOW_CLOSE_MINUTES = 15;

/** Standardised window length AFTER the scheduled slot (timeout rule). */
export const CONSULTATION_WINDOW_CLOSE_MS =
  CONSULTATION_WINDOW_CLOSE_MINUTES * 60 * 1000;

export interface ConsultationWindow {
  scheduledAt: Date | null;
  opensAt: Date | null;
  closesAt: Date | null;
  slotDurationMinutes: number;
}

export type ConsultationWindowStatus = 'not_started' | 'open' | 'ended';

/**
 * Resolve the scheduled date for an appointment. Prefers the real
 * `scheduledAt` timestamp; falls back to parsing the human readable slot.
 */
export function getAppointmentScheduledAt(
  scheduledAt?: string | Date | null,
  timeSlot?: string | null
): Date | null {
  if (scheduledAt) {
    const d = new Date(scheduledAt);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return parseTimeSlotToDate(timeSlot || null);
}

/**
 * Build the call window for an appointment. The window is STANDARDISED so
 * the patient list, doctor dashboard and video room all agree:
 *   opensAt  = scheduledAt − 5 minutes
 *   closesAt = scheduledAt + 15 minutes  (fixed session timeout)
 * `slotDurationMinutes` is retained only for informational / backwards
 * compatibility; it no longer shifts the join window.
 */
export function getConsultationWindow(
  scheduledAt?: string | Date | null,
  timeSlot?: string | null,
  slotDurationMinutes: number | null | undefined = 15
): ConsultationWindow {
  const scheduled = getAppointmentScheduledAt(scheduledAt, timeSlot);
  if (!scheduled) {
    return { scheduledAt: null, opensAt: null, closesAt: null, slotDurationMinutes: 0 };
  }
  const duration = Math.max(1, Math.round(Number(slotDurationMinutes) || 15));
  return {
    scheduledAt: scheduled,
    opensAt: new Date(scheduled.getTime() - CONSULTATION_JOIN_LEAD_MS),
    closesAt: new Date(scheduled.getTime() + CONSULTATION_WINDOW_CLOSE_MS),
    slotDurationMinutes: duration,
  };
}

/** Classify "now" relative to a consultation window. */
export function getConsultationWindowStatus(
  window: ConsultationWindow,
  now: Date = new Date()
): ConsultationWindowStatus {
  if (!window.opensAt || !window.closesAt) return 'ended';
  const t = now.getTime();
  if (t < window.opensAt.getTime()) return 'not_started';
  if (t > window.closesAt.getTime()) return 'ended';
  return 'open';
}

/* ------------------------------------------------------------------ */
/*  Unified appointment state used by every surface that renders a     */
/*  booking action / status (patient appointments, doctor dashboard).  */
/*  Precedence (first match wins):                                     */
/*    a) COMPLETED → "Session Completed", no call button               */
/*    b) CANCELLED → "Cancelled", no call button                       */
/*    c) NOW > slot + 15 min & status ≠ COMPLETED → "Session Timed Out"*/
/*    d) NOW ∈ [slot−5m, slot+15m] & CONFIRMED → active "Join Call"    */
/*    e) NOW < slot−5m → "Upcoming" with disabled "Opens at …" button  */
/* ------------------------------------------------------------------ */

export type AppointmentSlotState =
  | 'COMPLETED' // terminal — static "Session Completed" badge
  | 'CANCELLED' // terminal — static "Cancelled" badge
  | 'TIMED_OUT' // past slot + 15 min and not completed — no call
  | 'ACTIVE' // CONFIRMED and inside [slot−5m, slot+15m] — joinable now
  | 'UPCOMING' // before slot−5m — "Upcoming" / disabled "Opens at …"
  | 'NO_SLOT'; // no schedulable slot info on the record

export interface AppointmentSlotInfo {
  state: AppointmentSlotState;
  scheduledAt: Date | null;
  opensAt: Date | null;
  closesAt: Date | null;
  /** Whole minutes until the join window opens (0 when open/past). */
  minutesUntilOpens: number;
}

const NO_SLOT_INFO: Pick<
  AppointmentSlotInfo,
  'scheduledAt' | 'opensAt' | 'closesAt' | 'minutesUntilOpens'
> = { scheduledAt: null, opensAt: null, closesAt: null, minutesUntilOpens: 0 };

/**
 * Single source of truth for how a booking should be rendered right now:
 * which static badge to show, and whether a live call action is allowed.
 */
export function getAppointmentSlotInfo(
  appt: any,
  now: Date = new Date()
): AppointmentSlotInfo {
  if (!appt) return { state: 'NO_SLOT', ...NO_SLOT_INFO };

  // a) / b) Terminal booking statuses always win — never offer a call.
  if (appt.status === 'COMPLETED' || appt.status === 'CANCELLED') {
    return {
      state: appt.status === 'COMPLETED' ? 'COMPLETED' : 'CANCELLED',
      ...NO_SLOT_INFO,
    };
  }
  if (appt.status === 'TIMED_OUT') {
    return { state: 'TIMED_OUT', ...NO_SLOT_INFO };
  }

  const scheduled = getAppointmentScheduledAt(appt.scheduledAt, appt.timeSlot);
  if (!scheduled) {
    // No fixed slot recorded — legacy / flexible CONFIRMED bookings remain
    // joinable; everything else renders without a call action.
    return {
      state: appt.status === 'CONFIRMED' ? 'ACTIVE' : 'NO_SLOT',
      ...NO_SLOT_INFO,
    };
  }

  const opensAt = new Date(scheduled.getTime() - CONSULTATION_JOIN_LEAD_MS);
  const closesAt = new Date(scheduled.getTime() + CONSULTATION_WINDOW_CLOSE_MS);
  const nowMs = now.getTime();

  // c) Slot window (slot + 15 min) passed without COMPLETED → timed out.
  if (nowMs > closesAt.getTime()) {
    return { state: 'TIMED_OUT', scheduledAt: scheduled, opensAt, closesAt, minutesUntilOpens: 0 };
  }

  // e) Not yet inside the join lead-in → upcoming.
  if (nowMs < opensAt.getTime()) {
    return {
      state: 'UPCOMING',
      scheduledAt: scheduled,
      opensAt,
      closesAt,
      minutesUntilOpens: Math.ceil((opensAt.getTime() - nowMs) / 60000),
    };
  }

  // d) Inside [slot−5m, slot+15m] — only CONFIRMED bookings may join.
  return {
    state: appt.status === 'CONFIRMED' ? 'ACTIVE' : 'NO_SLOT',
    scheduledAt: scheduled,
    opensAt,
    closesAt,
    minutesUntilOpens: 0,
  };
}

/** True when a patient may initiate/join the call right now. */
export function isConsultationWindowOpen(
  scheduledAt?: string | Date | null,
  timeSlot?: string | null,
  slotDurationMinutes?: number | null,
  now: Date = new Date()
): boolean {
  return getConsultationWindowStatus(
    getConsultationWindow(scheduledAt, timeSlot, slotDurationMinutes),
    now
  ) === 'open';
}

/** Whole minutes until the call window opens (0 when already open). */
export function minutesUntilConsultationOpens(
  window: ConsultationWindow,
  now: Date = new Date()
): number {
  if (!window.opensAt) return 0;
  const diff = window.opensAt.getTime() - now.getTime();
  return diff > 0 ? Math.ceil(diff / 60000) : 0;
}

/** Human friendly "Mon, Sep 1 • 2:00 PM" style timestamp for UI messaging. */
export function formatConsultationTime(
  value: Date | string | null | undefined,
  withYear = false
): string {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const datePart = d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...(withYear ? { year: 'numeric' } : {}),
  });
  const timePart = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${datePart} • ${timePart}`;
}
