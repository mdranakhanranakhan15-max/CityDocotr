'use client';

import React from 'react';

interface VoiceVisualizerProps {
  isActive: boolean;
  mode: 'listening' | 'speaking' | 'idle';
  label?: string;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  isActive,
  mode,
  label,
}) => {
  if (!isActive && mode === 'idle') return null;

  const barCount = 7;
  const isListening = mode === 'listening';

  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-teal-500/40 shadow-lg text-xs">
      <div className="flex items-center gap-1 h-5">
        {Array.from({ length: barCount }).map((_, i) => {
          const delays = ['0ms', '150ms', '300ms', '100ms', '250ms', '400ms', '200ms'];
          const heights = ['12px', '20px', '16px', '24px', '14px', '22px', '10px'];

          return (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-200 ${
                isListening
                  ? 'bg-rose-500 animate-wave'
                  : 'bg-teal-400 animate-wave'
              }`}
              style={{
                height: isActive ? heights[i] : '4px',
                animationDelay: delays[i],
              }}
            />
          );
        })}
      </div>

      <span
        className={`font-semibold ${
          isListening ? 'text-rose-400' : 'text-teal-300'
        }`}
      >
        {label || (isListening ? 'Listening to your voice...' : 'AI speaking aloud...')}
      </span>
    </div>
  );
};

