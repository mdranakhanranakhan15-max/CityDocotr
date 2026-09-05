'use client';

import React from 'react';
import { HelpCircle, Stethoscope, Pill, HeartPulse, Sparkles } from 'lucide-react';

interface QuickPromptsProps {
  onSelectPrompt: (promptText: string) => void;
  disabled?: boolean;
}

const PROMPTS = [
  {
    icon: Stethoscope,
    label: 'Check Fever & Cough',
    text: 'I have had a mild fever (100.8°F) and dry cough for 2 days. What should I prepare for the doctor?',
  },
  {
    icon: HeartPulse,
    label: 'Headache & Light Sensitivity',
    text: 'I am experiencing a throbbing headache on one side with sensitivity to bright lights.',
  },
  {
    icon: Pill,
    label: 'Medication Questions',
    text: 'Can you help me formulate questions about potential side effects of my new prescription?',
  },
  {
    icon: HelpCircle,
    label: 'Skin Rash Triage',
    text: 'I noticed an itchy red rash on my arm after hiking. What should I show the dermatologist on camera?',
  },
];

export const QuickPrompts: React.FC<QuickPromptsProps> = ({
  onSelectPrompt,
  disabled,
}) => {
  return (
    <div className="space-y-2 py-2">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-teal-400" />
        <span>Quick Clinical Triage Suggestions:</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {PROMPTS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              disabled={disabled}
              onClick={() => onSelectPrompt(item.text)}
              className="p-2 text-left rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 hover:border-teal-500/40 text-slate-300 hover:text-teal-200 transition-all text-xs flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="p-1 rounded-lg bg-teal-500/10 text-teal-400 group-hover:bg-teal-500/20 shrink-0">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="truncate font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

