import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Radio,
  Wifi,
  Volume2,
  VolumeX,
  User,
  Heart,
  Activity,
  Maximize2,
  Sparkles,
  Lock,
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Clock
} from "lucide-react";
import { TelemedicineConsultation } from "../../types";
import { ScreenShareStage } from "./ScreenShareStage";

interface VideoCallStageProps {
  consultation: TelemedicineConsultation;
  doctorName: string;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  activeScreenSharePreset: string;
  onSelectScreenSharePreset: (id: string) => void;
  onStopScreenSharing: () => void;
  layoutMode: "speaker" | "split" | "presentation";
  showVitalsHud: boolean;
  callDurationSeconds: number;
  patientCameraSimulated: boolean;
  onTogglePatientCamera: () => void;
}

export const VideoCallStage: React.FC<VideoCallStageProps> = ({
  consultation,
  doctorName,
  isMuted,
  isCameraOff,
  isScreenSharing,
  activeScreenSharePreset,
  onSelectScreenSharePreset,
  onStopScreenSharing,
  layoutMode,
  showVitalsHud,
  callDurationSeconds,
  patientCameraSimulated,
  onTogglePatientCamera,
}) => {
  // Format call duration into MM:SS or HH:MM:SS
  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Simulated audio levels pulsing for voice activity
  const [patientAudioPulse, setPatientAudioPulse] = useState<number>(3);
  const [doctorAudioPulse, setDoctorAudioPulse] = useState<number>(4);

  useEffect(() => {
    const interval = setInterval(() => {
      setPatientAudioPulse(Math.floor(Math.random() * 5) + 1);
      if (!isMuted) {
        setDoctorAudioPulse(Math.floor(Math.random() * 5) + 1);
      } else {
        setDoctorAudioPulse(0);
      }
    }, 600);
    return () => clearInterval(interval);
  }, [isMuted]);

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] lg:h-[620px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col select-none">
      {/* Top Floating Stage Status Bar */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
        {/* Left: Patient Name & Consultation Type */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-lg text-xs">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-white tracking-wide">
            {consultation.patientName}
          </span>
          <span className="text-slate-400 font-medium hidden sm:inline">
            ({consultation.patientAge}y, {consultation.patientGender})
          </span>
          <span className="px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 font-semibold text-[10px] border border-teal-800/80 hidden md:inline">
            {consultation.consultationType}
          </span>
        </div>

        {/* Center: Live Call Duration & Recording Indicator */}
        <div className="pointer-events-auto flex items-center gap-2.5 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/80 shadow-lg text-xs font-mono">
          <div className="flex items-center gap-1.5 text-rose-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span>REC</span>
          </div>
          <span className="text-white font-bold tracking-wider">
            {formatDuration(callDurationSeconds)}
          </span>
        </div>

        {/* Right: Security & Network WebRTC Quality */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 bg-slate-900/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700/80 shadow-lg text-[11px] text-emerald-400 font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>256-bit Encrypted</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-900/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-700/80 shadow-lg text-[11px] text-slate-300 font-mono">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">1080p • 18ms</span>
          </div>
        </div>
      </div>

      {/* Main Stage Canvas Area */}
      <div className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center">
        {/* If Screen Share is Active, Show Screen Sharing Stage */}
        {isScreenSharing ? (
          <ScreenShareStage
            activePresetId={activeScreenSharePreset}
            onSelectPreset={onSelectScreenSharePreset}
            onStopSharing={onStopScreenSharing}
            patientName={consultation.patientName}
          />
        ) : (
          /* Primary Video Feed: Remote Patient View */
          <div
            className={`w-full h-full relative transition-all duration-300 ${
              layoutMode === "split" ? "grid grid-cols-1 md:grid-cols-2 gap-2 p-3 bg-slate-950" : "flex items-center justify-center"
            }`}
          >
            {/* Remote Patient Video Box */}
            <div className="w-full h-full relative bg-radial from-slate-900 via-slate-950 to-black overflow-hidden flex items-center justify-center rounded-xl">
              {patientCameraSimulated ? (
                /* Simulated Patient Stream (Animated High-Fidelity Medical Video Feed) */
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  {/* Subtle ambient lighting simulation */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none"></div>

                  {/* Simulated Patient Silhouette / Portrait Component */}
                  <div className="relative flex flex-col items-center justify-center">
                    <div className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-full p-1 bg-gradient-to-tr from-teal-500/40 via-slate-700 to-indigo-500/30 shadow-2xl flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-slate-800/90 border-2 border-slate-700 flex flex-col items-center justify-center overflow-hidden relative">
                        {/* Medical avatar graphic */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-teal-900/60 text-teal-300 border border-teal-700/50 flex items-center justify-center text-3xl font-bold shadow-inner">
                          JM
                        </div>
                        <div className="absolute bottom-2 text-[10px] font-semibold tracking-wider text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-700">
                          PATIENT FEED
                        </div>
                      </div>

                      {/* Animated audio wave ripples around patient when speaking */}
                      <div className="absolute -inset-2 rounded-full border border-teal-500/30 animate-ping opacity-40 pointer-events-none"></div>
                    </div>

                    {/* Patient Nameplate & Active Speech Spectrum */}
                    <div className="mt-4 flex flex-col items-center text-center">
                      <h4 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
                        {consultation.patientName}
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        {consultation.chiefComplaint}
                      </p>

                      {/* Audio visualizer spectrum bars */}
                      <div className="flex items-center gap-1 mt-3 px-3 py-1 bg-slate-900/80 rounded-full border border-slate-800">
                        <Volume2 className="w-3.5 h-3.5 text-teal-400 mr-1" />
                        {[1, 2, 3, 4, 5, 4, 3, 2].map((val, idx) => (
                          <div
                            key={idx}
                            className="w-1 bg-teal-400 rounded-full transition-all duration-200"
                            style={{
                              height: `${Math.min(20, Math.max(4, val * patientAudioPulse))}px`,
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Watermark / Feed Metadata Overlay */}
                  <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-2">
                    <span className="text-teal-400 font-bold">WEBRTC</span>
                    <span>H.264 • 60 FPS • LOW LATENCY</span>
                  </div>
                </div>
              ) : (
                /* Patient Camera Disabled View */
                <div className="flex flex-col items-center justify-center text-center p-6">
                  <div className="w-24 h-24 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mb-3">
                    <CameraOff className="w-10 h-10 text-slate-500" />
                  </div>
                  <h4 className="text-white font-semibold text-sm">Patient Camera Muted</h4>
                  <p className="text-xs text-slate-400 mt-1">Audio stream remains active</p>
                </div>
              )}
            </div>

            {/* In Split 50/50 Layout: Doctor Tile takes second column */}
            {layoutMode === "split" && (
              <div className="w-full h-full relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col items-center justify-center p-4">
                <div className="relative flex flex-col items-center justify-center">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-slate-800 border-2 border-teal-500/50 flex flex-col items-center justify-center shadow-xl mb-3">
                    <div className="w-20 h-20 rounded-full bg-teal-900/50 text-teal-300 flex items-center justify-center text-2xl font-bold">
                      SC
                    </div>
                  </div>
                  <h4 className="text-white font-bold text-sm sm:text-base">{doctorName} (You)</h4>
                  <p className="text-xs text-slate-400">Cardiology & Internal Medicine</p>
                  <div className="flex items-center gap-2 mt-2">
                    {isMuted ? (
                      <span className="px-2 py-0.5 bg-rose-950 text-rose-300 rounded text-[10px] font-semibold border border-rose-800">
                        Mic Muted
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 rounded text-[10px] font-semibold border border-emerald-800">
                        Mic Active
                      </span>
                    )}
                    {isCameraOff ? (
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px] border border-slate-700">
                        Video Paused
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-teal-950 text-teal-300 rounded text-[10px] font-semibold border border-teal-800">
                        HD 1080p
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Doctor Self-View Picture-in-Picture (PIP) Window (Visible when NOT in split mode) */}
        {layoutMode !== "split" && (
          <div
            id="doctor-pip-window"
            className="absolute bottom-4 right-4 z-30 w-36 h-28 sm:w-52 sm:h-36 bg-slate-900/95 backdrop-blur-md rounded-xl border-2 border-slate-700/80 shadow-2xl overflow-hidden flex flex-col justify-between p-2 group hover:border-teal-500/70 transition-all select-none"
          >
            {/* Top PIP status badges */}
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-semibold text-slate-300 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800">
                You (Clinician)
              </span>
              <div className="flex items-center gap-1">
                {isMuted ? (
                  <MicOff className="w-3 h-3 text-rose-400" />
                ) : (
                  <div className="flex items-center gap-0.5">
                    <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                    <span className="w-1 h-3 bg-emerald-400 rounded-full"></span>
                  </div>
                )}
                {isCameraOff && <CameraOff className="w-3 h-3 text-rose-400 ml-1" />}
              </div>
            </div>

            {/* Center Doctor Feed Placeholder */}
            <div className="flex-1 flex flex-col items-center justify-center my-1">
              {!isCameraOff ? (
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-teal-900/60 text-teal-200 border border-teal-600/60 flex items-center justify-center font-bold text-xs sm:text-base shadow-sm">
                    SC
                  </div>
                  <span className="text-[10px] text-teal-300 font-medium mt-1 truncate max-w-[120px]">
                    {doctorName}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-slate-500">
                  <CameraOff className="w-6 h-6 mb-1 text-slate-600" />
                  <span className="text-[9px]">Camera Inactive</span>
                </div>
              )}
            </div>

            {/* Bottom Mic Meter bar */}
            <div className="w-full bg-slate-950/80 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-150 ${isMuted ? "bg-slate-700 w-0" : "bg-emerald-500"}`}
                style={{ width: isMuted ? "0%" : `${doctorAudioPulse * 20}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Floating Patient Vitals Telemetry HUD (Toggleable overlay directly on video) */}
        {showVitalsHud && (
          <div className="absolute top-16 left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-xl text-xs space-y-2 max-w-[200px] animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-[11px] text-slate-400">
              <span className="font-semibold text-teal-400 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" />
                Live Vitals HUD
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">BP</span>
                <span className="font-bold text-amber-400 font-mono">
                  {consultation.vitals.bloodPressure}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Heart Rate</span>
                <span className="font-bold text-emerald-400 font-mono flex items-center gap-1">
                  <Heart className="w-3 h-3 text-rose-500 animate-pulse inline" />
                  {consultation.vitals.heartRate} bpm
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">SpO₂</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {consultation.vitals.spo2}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Temp</span>
                <span className="font-bold text-slate-200 font-mono">
                  {consultation.vitals.temperature}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
