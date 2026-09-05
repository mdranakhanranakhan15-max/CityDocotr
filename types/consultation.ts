export type CallStatus = 'idle' | 'calling' | 'connected' | 'ended';

export interface CallControlsState {
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  speakerVolume: number;
}

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  audioGenerated?: boolean;
  isAudioPlaying?: boolean;
  quickActions?: string[];
}

export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  interimTranscript: string;
  speechSupported: boolean;
  autoTtsEnabled: boolean;
  selectedVoiceName?: string;
  error?: string | null;
}

