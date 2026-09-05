'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Doctor } from '@/types/doctor';
import { ChatMessage as ChatMessageType, VoiceState } from '@/types/consultation';
import { ChatMessage } from './ChatMessage';
import { VoiceVisualizer } from './VoiceVisualizer';
import { QuickPrompts } from './QuickPrompts';
import { getSpeechManager } from '@/utils/speech';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Bot,
  Volume2,
  VolumeX,
  RotateCcw,
  Loader2,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

interface VoiceAssistantProps {
  doctor: Doctor;
  isCallActive: boolean;
}

const INITIAL_MESSAGE: ChatMessageType = {
  id: 'msg-welcome',
  role: 'assistant',
  content: `Hello! I am **Dr. Aria**, your AI Medical Assistant. 🎙️ You can click the **Microphone** button to speak your symptoms directly to me, or type in the box below. I will help triage your concerns and suggest key questions for your consultation.`,
  timestamp: 'Just now',
};

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  doctor,
  isCallActive,
}) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoTts, setAutoTts] = useState(true);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isSpeaking: false,
    transcript: '',
    interimTranscript: '',
    speechSupported: true,
    autoTtsEnabled: true,
    error: null,
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const speechManager = useRef(getSpeechManager());

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, voiceState.interimTranscript, isLoading]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      speechManager.current.stopListening();
      speechManager.current.stopSpeaking();
    };
  }, []);

  /**
   * Handle Speech-to-Text Microphone toggle
   */
  const handleToggleListening = () => {
    if (voiceState.isListening) {
      speechManager.current.stopListening();
      setVoiceState((prev) => ({
        ...prev,
        isListening: false,
        interimTranscript: '',
      }));
    } else {
      // Clear previous error
      setVoiceState((prev) => ({ ...prev, error: null }));

      // Stop any active TTS audio before listening
      handleStopSpeaking();

      const success = speechManager.current.startListening(
        (finalTranscript, interim) => {
          if (finalTranscript) {
            setInputValue((prev) => {
              const combined = prev ? `${prev} ${finalTranscript}` : finalTranscript;
              return combined.trim();
            });
          }
          setVoiceState((prev) => ({
            ...prev,
            interimTranscript: interim,
          }));
        },
        (errorMsg) => {
          setVoiceState((prev) => ({
            ...prev,
            isListening: false,
            error: errorMsg,
          }));
        },
        () => {
          setVoiceState((prev) => ({
            ...prev,
            isListening: false,
            interimTranscript: '',
          }));
        }
      );

      if (success) {
        setVoiceState((prev) => ({ ...prev, isListening: true }));
      }
    }
  };

  /**
   * Speak text using Web Speech API TTS
   */
  const handleSpeakText = (text: string, messageId: string) => {
    setSpeakingMessageId(messageId);
    setVoiceState((prev) => ({ ...prev, isSpeaking: true }));

    speechManager.current.speak(
      text,
      () => {
        setVoiceState((prev) => ({ ...prev, isSpeaking: true }));
      },
      () => {
        setVoiceState((prev) => ({ ...prev, isSpeaking: false }));
        setSpeakingMessageId(null);
      },
      (err) => {
        console.warn('Speech synthesis error:', err);
        setVoiceState((prev) => ({ ...prev, isSpeaking: false }));
        setSpeakingMessageId(null);
      }
    );
  };

  const handleStopSpeaking = () => {
    speechManager.current.stopSpeaking();
    setVoiceState((prev) => ({ ...prev, isSpeaking: false }));
    setSpeakingMessageId(null);
  };

  /**
   * Submit query to AI
   */
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    // Stop listening if user is sending
    if (voiceState.isListening) {
      speechManager.current.stopListening();
      setVoiceState((prev) => ({
        ...prev,
        isListening: false,
        interimTranscript: '',
      }));
    }

    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          doctorName: doctor.name,
          specialty: doctor.specialty,
        }),
      });

      const data = await response.json();
      const aiReply = data.reply || 'I am having trouble processing that right now. Please discuss this symptom directly with your physician.';

      const assistantMessage: ChatMessageType = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Automatically speak the response if autoTts is enabled
      if (autoTts) {
        handleSpeakText(aiReply, assistantMessage.id);
      }
    } catch (err: any) {
      const errorMessage: ChatMessageType = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: '⚠️ Unable to connect to the medical assistant service. Please check your connection or discuss directly with the doctor.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    handleStopSpeaking();
    setMessages([INITIAL_MESSAGE]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Header bar */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-slate-100 text-xs sm:text-sm">
                AI Clinical Assistant (Dr. Aria)
              </h3>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30">
                Voice Enabled
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Assisting consultation with {doctor.name}
            </p>
          </div>
        </div>

        {/* Right toggles */}
        <div className="flex items-center gap-2">
          {/* TTS Auto-Speech Toggle */}
          <button
            onClick={() => {
              setAutoTts(!autoTts);
              if (autoTts && voiceState.isSpeaking) {
                handleStopSpeaking();
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
              autoTts
                ? 'bg-teal-500/10 text-teal-300 border-teal-500/30 hover:bg-teal-500/20'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title={autoTts ? 'Auto Text-to-Speech is ON' : 'Auto Text-to-Speech is OFF'}
          >
            {autoTts ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden sm:inline">Voice Replies: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Voice Replies: OFF</span>
              </>
            )}
          </button>

          {/* Reset chat button */}
          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
            title="Reset Chat History"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live Voice Status Indicator / Equalizer */}
      {(voiceState.isListening || voiceState.isSpeaking) && (
        <div className="px-4 py-2 bg-slate-950/90 border-b border-teal-500/20 flex items-center justify-between">
          <VoiceVisualizer
            isActive={true}
            mode={voiceState.isListening ? 'listening' : 'speaking'}
          />
          {voiceState.isSpeaking && (
            <button
              onClick={handleStopSpeaking}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20"
            >
              Mute Voice
            </button>
          )}
        </div>
      )}

      {/* Error alert if mic permission failed */}
      {voiceState.error && (
        <div className="mx-4 my-2 p-2.5 rounded-xl bg-rose-950/60 border border-rose-600/40 text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{voiceState.error}</span>
          </div>
          <button
            onClick={() => setVoiceState((prev) => ({ ...prev, error: null }))}
            className="text-[11px] font-bold text-rose-400 hover:text-rose-300"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[180px] max-h-[360px] lg:max-h-none"
      >
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            isCurrentlySpeaking={speakingMessageId === msg.id && voiceState.isSpeaking}
            onSpeak={(text, id) => handleSpeakText(text, id)}
            onStopSpeech={handleStopSpeaking}
            onSelectPrompt={(p) => handleSendMessage(p)}
          />
        ))}

        {/* Interim Speech Transcript Bubble (While speaking) */}
        {voiceState.interimTranscript && (
          <div className="flex justify-end my-2">
            <div className="max-w-[80%] rounded-2xl p-3 bg-teal-900/40 border border-teal-500/50 text-teal-200 text-xs italic animate-pulse">
              <span className="text-[10px] block font-semibold text-teal-400 not-italic">
                🎙️ Listening to you...
              </span>
              &ldquo;{voiceState.interimTranscript}&rdquo;
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-slate-400 text-xs max-w-max">
            <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
            <span>Dr. Aria is formulating clinical notes...</span>
          </div>
        )}

        {/* Quick Prompts below initial message */}
        {messages.length <= 2 && !isLoading && (
          <QuickPrompts
            onSelectPrompt={(text) => handleSendMessage(text)}
            disabled={isLoading || voiceState.isListening}
          />
        )}
      </div>

      {/* Input and Microphone Control Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/70">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Microphone Speech-To-Text Button */}
          <button
            type="button"
            onClick={handleToggleListening}
            className={`p-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 ${
              voiceState.isListening
                ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-400 shadow-lg shadow-rose-600/30'
                : 'bg-teal-600/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30 hover:text-white focus:ring-teal-500'
            }`}
            title={
              voiceState.isListening
                ? 'Stop listening'
                : 'Speak to AI Assistant (Speech-to-Text)'
            }
          >
            {voiceState.isListening ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          {/* Text Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={
                voiceState.isListening
                  ? 'Listening to your microphone...'
                  : 'Describe symptoms or ask clinical questions...'
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-900 border border-slate-750 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 disabled:opacity-50"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="p-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-teal-500/20 active:scale-95"
            title="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Medical disclaimer note */}
        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 px-1">
          <span className="flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-slate-500" />
            AI advice is for triage preparation; consult your physician for final diagnosis.
          </span>
          <span className="hidden sm:inline">Web Speech API STT/TTS</span>
        </div>
      </div>
    </div>
  );
};

