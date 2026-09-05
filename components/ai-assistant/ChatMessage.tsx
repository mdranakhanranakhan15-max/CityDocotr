'use client';

import React from 'react';
import { ChatMessage as ChatMessageType } from '@/types/consultation';
import { Bot, User, Volume2, VolumeX, Sparkles, AlertTriangle } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
  isCurrentlySpeaking: boolean;
  onSpeak: (text: string, messageId: string) => void;
  onStopSpeech: () => void;
  onSelectPrompt?: (prompt: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isCurrentlySpeaking,
  onSpeak,
  onStopSpeech,
  onSelectPrompt,
}) => {
  const isAssistant = message.role === 'assistant';
  const isWarning = message.content.includes('⚠️') || message.content.includes('emergency') || message.content.includes('911');

  // Format line breaks and bullet points cleanly
  const renderFormattedContent = (content: string) => {
    return content.split('\n').map((line, idx) => {
      if (!line.trim()) return <div key={idx} className="h-1.5" />;

      if (line.startsWith('•') || line.startsWith('-')) {
        return (
          <div key={idx} className="flex items-start gap-1.5 my-0.5 pl-1">
            <span className="text-teal-400 font-bold">•</span>
            <span>{line.replace(/^[•-]\s*/, '')}</span>
          </div>
        );
      }

      if (/^\d+\./.test(line)) {
        return (
          <div key={idx} className="flex items-start gap-1.5 my-0.5 pl-1">
            <span className="text-teal-400 font-semibold">{line.slice(0, 2)}</span>
            <span>{line.replace(/^\d+\.\s*/, '')}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="my-0.5 leading-relaxed">
          {line}
        </p>
      );
    });
  };

  return (
    <div
      className={`flex items-start gap-3 my-3 text-xs sm:text-sm ${
        isAssistant ? 'justify-start' : 'justify-end'
      }`}
    >
      {/* Assistant Avatar */}
      {isAssistant && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-teal-500/20 border border-teal-400/40">
          <Bot className="w-4 h-4" />
        </div>
      )}

      {/* Message Content Bubble */}
      <div
        className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 shadow-md space-y-2 ${
          isAssistant
            ? isWarning
              ? 'bg-amber-950/40 border border-amber-500/40 text-amber-100'
              : 'bg-slate-800/90 border border-slate-700/80 text-slate-200'
            : 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-medium rounded-tr-sm'
        }`}
      >
        {/* Top Header info for assistant */}
        {isAssistant && (
          <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-700/50 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-teal-400" />
              <span className="font-semibold text-teal-300">Dr. Aria (AI Assistant)</span>
            </div>
            <span>{message.timestamp}</span>
          </div>
        )}

        {/* Text Content */}
        <div className="text-xs sm:text-[13px]">{renderFormattedContent(message.content)}</div>

        {/* Assistant Bottom Controls (TTS read aloud button) */}
        {isAssistant && (
          <div className="pt-1.5 flex items-center justify-between gap-2 text-[11px]">
            <button
              onClick={() => {
                if (isCurrentlySpeaking) {
                  onStopSpeech();
                } else {
                  onSpeak(message.content, message.id);
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors font-medium ${
                isCurrentlySpeaking
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 animate-pulse'
                  : 'bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600/40'
              }`}
              title={isCurrentlySpeaking ? 'Stop speaking' : 'Read response aloud (Text-to-Speech)'}
            >
              {isCurrentlySpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-teal-400" />
                  <span>Stop Speech</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Listen Aloud (TTS)</span>
                </>
              )}
            </button>

            {isWarning && (
              <span className="text-amber-400 flex items-center gap-1 text-[10px] font-semibold">
                <AlertTriangle className="w-3 h-3" />
                Medical Priority
              </span>
            )}
          </div>
        )}

        {/* User Timestamp */}
        {!isAssistant && (
          <div className="text-[10px] text-teal-100 text-right opacity-80 pt-0.5">
            {message.timestamp}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {!isAssistant && (
        <div className="w-8 h-8 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-200 shrink-0 shadow">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};

