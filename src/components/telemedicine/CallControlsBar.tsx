import React from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  StopCircle,
  PhoneOff,
  LayoutGrid,
  FileSignature,
  Activity,
  Maximize2,
  Minimize2,
  MessageSquare,
  Sparkles,
  ChevronUp
} from "lucide-react";

interface CallControlsBarProps {
  isMuted: boolean;
  onToggleMute: () => void;
  isCameraOff: boolean;
  onToggleCamera: () => void;
  isScreenSharing: boolean;
  onToggleScreenShare: () => void;
  layoutMode: "speaker" | "split" | "presentation";
  onChangeLayout: (layout: "speaker" | "split" | "presentation") => void;
  showVitalsHud: boolean;
  onToggleVitalsHud: () => void;
  isChatOpen: boolean;
  onToggleChat: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenRxModal: () => void;
  onEndCall: () => void;
  onOpenScreenSharePicker: () => void;
}

export const CallControlsBar: React.FC<CallControlsBarProps> = ({
  isMuted,
  onToggleMute,
  isCameraOff,
  onToggleCamera,
  isScreenSharing,
  onToggleScreenShare,
  layoutMode,
  onChangeLayout,
  showVitalsHud,
  onToggleVitalsHud,
  isChatOpen,
  onToggleChat,
  isFullscreen,
  onToggleFullscreen,
  onOpenRxModal,
  onEndCall,
  onOpenScreenSharePicker,
}) => {
  return (
    <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl px-3 py-2.5 sm:px-6 sm:py-3 shadow-xl flex items-center justify-between gap-2 sm:gap-4 select-none">
      {/* Left utility tools */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Layout Switcher */}
        <div className="flex items-center bg-slate-800/80 rounded-xl p-0.5 border border-slate-700/60">
          <button
            type="button"
            id="btn-layout-speaker"
            onClick={() => onChangeLayout("speaker")}
            title="Focus Speaker View"
            className={`p-2 rounded-lg text-xs font-semibold transition-all ${
              layoutMode === "speaker"
                ? "bg-teal-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="hidden md:inline mr-1 text-[11px]">Focus</span>
            <span className="md:hidden">1:1</span>
          </button>
          <button
            type="button"
            id="btn-layout-split"
            onClick={() => onChangeLayout("split")}
            title="Split 50/50 View"
            className={`p-2 rounded-lg text-xs font-semibold transition-all ${
              layoutMode === "split"
                ? "bg-teal-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 inline md:mr-1" />
            <span className="hidden md:inline text-[11px]">Split</span>
          </button>
        </div>

        {/* Vitals HUD Toggle */}
        <button
          type="button"
          id="btn-toggle-vitals-hud"
          onClick={onToggleVitalsHud}
          title={showVitalsHud ? "Hide Vitals Overlay" : "Show Vitals Overlay"}
          className={`flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-medium border transition-all ${
            showVitalsHud
              ? "bg-teal-900/60 text-teal-300 border-teal-500/40"
              : "bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-white"
          }`}
        >
          <Activity className="w-4 h-4 text-teal-400" />
          <span className="hidden lg:inline text-[11px]">Vitals HUD</span>
        </button>
      </div>

      {/* Center Primary AV Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Microphone Toggle */}
        <button
          type="button"
          id="btn-toggle-mic"
          onClick={onToggleMute}
          title={isMuted ? "Unmute Microphone (M)" : "Mute Microphone (M)"}
          className={`relative p-3 sm:px-4 sm:py-3 rounded-2xl flex items-center gap-2 font-semibold text-xs transition-all shadow-md ${
            isMuted
              ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/40"
              : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          }`}
        >
          {isMuted ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />}
          <span className="hidden sm:inline text-xs">{isMuted ? "Muted" : "Mute"}</span>
          {!isMuted && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          )}
        </button>

        {/* Camera Toggle */}
        <button
          type="button"
          id="btn-toggle-camera"
          onClick={onToggleCamera}
          title={isCameraOff ? "Turn Camera On (V)" : "Turn Camera Off (V)"}
          className={`p-3 sm:px-4 sm:py-3 rounded-2xl flex items-center gap-2 font-semibold text-xs transition-all shadow-md ${
            isCameraOff
              ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/40"
              : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
          }`}
        >
          {isCameraOff ? <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Video className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />}
          <span className="hidden sm:inline text-xs">{isCameraOff ? "Camera Off" : "Video On"}</span>
        </button>

        {/* Screen Share Toggle & Picker */}
        <div className="relative flex items-center">
          <button
            type="button"
            id="btn-toggle-screenshare"
            onClick={isScreenSharing ? onToggleScreenShare : onOpenScreenSharePicker}
            title={isScreenSharing ? "Stop Screen Share" : "Share Clinical Screen / Imaging"}
            className={`p-3 sm:px-4 sm:py-3 rounded-2xl flex items-center gap-2 font-semibold text-xs transition-all shadow-md ${
              isScreenSharing
                ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/40 animate-pulse"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
          >
            {isScreenSharing ? (
              <>
                <StopCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="hidden sm:inline text-xs font-bold">Stop Share</span>
              </>
            ) : (
              <>
                <ScreenShare className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                <span className="hidden sm:inline text-xs">Share Screen</span>
              </>
            )}
          </button>
        </div>

        {/* End Call Button */}
        <button
          type="button"
          id="btn-end-consultation"
          onClick={onEndCall}
          title="End Telemedicine Consultation"
          className="p-3 sm:px-5 sm:py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-rose-900/50"
        >
          <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">End Call</span>
        </button>
      </div>

      {/* Right Quick Clinical Tools & Sidebar Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Quick E-Prescription Launch */}
        <button
          type="button"
          id="btn-quick-rx"
          onClick={onOpenRxModal}
          title="Draft E-Prescription for this Patient"
          className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold transition-all shadow-xs"
        >
          <FileSignature className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px]">Write Rx</span>
        </button>

        {/* Chat / Sidebar Toggle */}
        <button
          type="button"
          id="btn-toggle-chat-sidebar"
          onClick={onToggleChat}
          title="Toggle Chat & Clinical Notes Sidebar"
          className={`p-2.5 rounded-xl border transition-all ${
            isChatOpen
              ? "bg-teal-600 text-white border-teal-500 shadow-md"
              : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          type="button"
          id="btn-toggle-fullscreen"
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          className="p-2.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all hidden sm:block"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
