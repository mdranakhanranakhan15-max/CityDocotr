/**
 * Ringing sound effect generated with the Web Audio API (no audio asset needed).
 * Plays a short phone-ringing pattern (two-tone trill) in a loop.
 */

let audioCtx: AudioContext | null = null;
let ringInterval: ReturnType<typeof setInterval> | null = null;
let isPlaying = false;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  return audioCtx;
}

function beep(freq: number, durationMs: number, volume = 0.18) {
  const ctx = getContext();
  if (!ctx || ctx.state === 'suspended') {
    if (ctx) ctx.resume();
    return;
  }
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;

  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + durationMs / 1000 + 0.05);
}

function playRingCycle() {
  // Classic "brrrrring" trill: 425Hz repeated in pairs
  beep(425, 220, 0.16);
  setTimeout(() => beep(425, 220, 0.16), 260);
  setTimeout(() => beep(500, 260, 0.16), 520);
}

export function playRingtone(): void {
  if (isPlaying) return;
  isPlaying = true;
  const ctx = getContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }
  playRingCycle();
  ringInterval = setInterval(playRingCycle, 1300);
}

export function stopRingtone(): void {
  isPlaying = false;
  if (ringInterval) {
    clearInterval(ringInterval);
    ringInterval = null;
  }
}
