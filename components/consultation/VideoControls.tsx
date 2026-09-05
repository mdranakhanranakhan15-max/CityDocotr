'use client';

import React from 'react';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  PhoneCall,
  ScreenShare,
  Maximize2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CallControlsState } from '@/types/consultation';

interface VideoControlsProps {
  isCallActive: boolean;
  controlsState: CallControlsState;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onToggleSpeaker: () => void;
  onStartCall: () => void;
  onEndCall: () => void;
  onToggleFullscreen?: () => void;
}

export const VideoControls: React.FC<VideoControlsProps> = ({
  isCallActive,
  controlsState,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onToggleSpeaker,
  onStartCall,
  onEndCall,
  onToggleFullscreen,
}) => {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 sm:gap-3.5 px-4 py-2.5 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-slate-700/60 shadow-2xl">
      {/* Microphone Toggle */}
      <button
        onClick={onToggleMic}
        disabled={!isCallActive}
        className={`p-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 ${
          !isCallActive
            ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-500'
            : controlsState.isMuted
            ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 focus:ring-red-500'
            : 'bg-slate-800/90 text-slate-200 border border-slate-700 hover:bg-slate-750 hover:text-white focus:ring-teal-500'
        }`}
        title={controlsState.isMuted ? 'Unmute Audio (Mic)' : 'Mute Audio (Mic)'}
      >
        {controlsState.isMuted ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>

      {/* Camera Toggle */}
      <button
        onClick={onToggleCamera}
        disabled={!isCallActive}
        className={`p-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 ${
          !isCallActive
            ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-500'
            : controlsState.isCameraOff
            ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 focus:ring-red-500'
            : 'bg-slate-800/90 text-slate-200 border border-slate-700 hover:bg-slate-750 hover:text-white focus:ring-teal-500'
        }`}
        title={controlsState.isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
      >
        {controlsState.isCameraOff ? (
          <VideoOff className="w-5 h-5" />
        ) : (
          <VideoIcon className="w-5 h-5" />
        )}
      </button>

      {/* Screen Share */}
      <button
        onClick={onToggleScreenShare}
        disabled={!isCallActive}
        className={`p-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 ${
          !isCallActive
            ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-500'
            : controlsState.isScreenSharing
            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50 hover:bg-teal-500/30 focus:ring-teal-500'
            : 'bg-slate-800/90 text-slate-200 border border-slate-700 hover:bg-slate-750 hover:text-white focus:ring-teal-500'
        }`}
        title={controlsState.isScreenSharing ? 'Stop Sharing Screen' : 'Share Medical Records / Screen'}
      >
        <ScreenShare className="w-5 h-5" />
      </button>

      {/* Speaker Mute/Unmute */}
      <button
        onClick={onToggleSpeaker}
        disabled={!isCallActive}
        className={`hidden sm:flex p-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 ${
          !isCallActive
            ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-500'
            : controlsState.speakerVolume === 0
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            : 'bg-slate-800/90 text-slate-200 border border-slate-700 hover:bg-slate-750 hover:text-white focus:ring-teal-500'
        }`}
        title={controlsState.speakerVolume === 0 ? 'Unmute Audio Output' : 'Mute Audio Output'}
      >
        {controlsState.speakerVolume === 0 ? (
          <VolumeX className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </button>

      {/* Call Primary Action (Start / End Call) */}
      {isCallActive ? (
        <button
          onClick={onEndCall}
          className="px-4 sm:px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-red-500/30 transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400"
          title="End Consultation Call"
        >
          <PhoneOff className="w-5 h-5" />
          <span className="text-xs sm:text-sm font-bold">End Call</span>
        </button>
      ) : (
        <button
          onClick={onStartCall}
          className="px-4 sm:px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold flex items-center gap-2 shadow-lg shadow-teal-500/25 transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-teal-300"
          title="Start Live Consultation"
        >
          <PhoneCall className="w-5 h-5 text-slate-950 animate-pulse" />
          <span className="text-xs sm:text-sm">Start Video Call</span>
        </button>
      )}

      {/* Fullscreen button */}
      {onToggleFullscreen && (
        <button
          onClick={onToggleFullscreen}
          className="hidden md:flex p-3 rounded-xl bg-slate-800/90 text-slate-200 border border-slate-700 hover:bg-slate-750 hover:text-white transition-colors"
          title="Toggle Fullscreen Video"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

