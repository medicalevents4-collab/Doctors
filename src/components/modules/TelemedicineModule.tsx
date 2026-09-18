import React, { useState, useEffect } from "react";
import {
  Video,
  PhoneCall,
  PhoneOff,
  User,
  ShieldCheck,
  Radio,
  FileSignature,
  Share2,
  Calendar,
  Layers,
  Sparkles,
  Lock,
  Maximize2,
  Minimize2,
  Activity,
  AlertCircle,
  Clock,
  CheckCircle2,
  Send,
  X
} from "lucide-react";
import { DoctorProfile, ModuleId, TelemedicineConsultation } from "../../types";
import { VideoCallStage } from "../telemedicine/VideoCallStage";
import { CallControlsBar } from "../telemedicine/CallControlsBar";
import { ConsultationChatSidebar } from "../telemedicine/ConsultationChatSidebar";
import { ScreenSharePickerModal } from "../telemedicine/ScreenSharePickerModal";
import { EndConsultationModal } from "../telemedicine/EndConsultationModal";
import { TelemedicineQueue, MOCK_TELEMEDICINE_QUEUE } from "../telemedicine/TelemedicineQueue";
import { useI18n } from "../../i18n/I18nContext";

interface TelemedicineModuleProps {
  doctor?: DoctorProfile;
  onNavigate?: (module: ModuleId) => void;
}

const DEFAULT_DOCTOR: DoctorProfile = {
  name: "Dr. Sarah Chen",
  title: "MD, FCP(SA)",
  specialty: "Cardiology & Internal Medicine",
  licenseNumber: "HPCSA #MP098231",
  practiceNumber: "BHF #0142890",
  clinicName: "Metro Medical Center — West Wing",
  initials: "SC",
};

export const TelemedicineModule: React.FC<TelemedicineModuleProps> = ({
  doctor = DEFAULT_DOCTOR,
  onNavigate,
}) => {
  const { t } = useI18n();

  // Active Consultation session
  const [currentSession, setCurrentSession] = useState<TelemedicineConsultation>(
    MOCK_TELEMEDICINE_QUEUE[0]
  );

  // Call Status State
  const [isCallActive, setIsCallActive] = useState<boolean>(true);
  const [callDurationSeconds, setCallDurationSeconds] = useState<number>(372); // 6m 12s initial

  // Audio / Video Controls
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isCameraOff, setIsCameraOff] = useState<boolean>(false);
  const [patientCameraSimulated, setPatientCameraSimulated] = useState<boolean>(true);

  // Screen Sharing State
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [activeScreenSharePreset, setActiveScreenSharePreset] = useState<string>("radiology");
  const [isScreenSharePickerOpen, setIsScreenSharePickerOpen] = useState<boolean>(false);

  // Layout and Display Modes
  const [layoutMode, setLayoutMode] = useState<"speaker" | "split" | "presentation">("speaker");
  const [showVitalsHud, setShowVitalsHud] = useState<boolean>(true);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Modals
  const [isEndCallModalOpen, setIsEndCallModalOpen] = useState<boolean>(false);
  const [isQuickRxModalOpen, setIsQuickRxModalOpen] = useState<boolean>(false);
  const [rxSuccessNotice, setRxSuccessNotice] = useState<boolean>(false);

  // Timer Tick
  useEffect(() => {
    let timer: any = null;
    if (isCallActive) {
      timer = setInterval(() => {
        setCallDurationSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isCallActive]);

  // Keyboard Shortcuts (M for Mute, V for Video, S for Screen Share)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "m" || e.key === "M") {
        setIsMuted((prev) => !prev);
      } else if (e.key === "v" || e.key === "V") {
        setIsCameraOff((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleStartCall = () => {
    setIsCallActive(true);
    setCallDurationSeconds(0);
  };

  const handleConfirmEndCall = () => {
    setIsCallActive(false);
    setIsEndCallModalOpen(false);
    setIsScreenSharing(false);
  };

  const handleSelectSessionFromQueue = (session: TelemedicineConsultation) => {
    setCurrentSession(session);
    setIsCallActive(true);
    setCallDurationSeconds(0);
  };

  const handleIssueQuickRx = (e: React.FormEvent) => {
    e.preventDefault();
    setRxSuccessNotice(true);
    setTimeout(() => {
      setRxSuccessNotice(false);
      setIsQuickRxModalOpen(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Module Overview Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-teal-600 text-white rounded-2xl shadow-sm flex items-center justify-center">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Telemedicine Video Suite
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                WebRTC P2P Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulated encrypted video consultation room with screen sharing, live ECG/radiology broadcasting, and chat telemetry
            </p>
          </div>
        </div>

        {/* Header Action Badges */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span>Clinician: {doctor.name}</span>
          </div>

          <div className="px-3 py-1.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-teal-600" />
            <span>POPIA & HIPAA Encrypted</span>
          </div>
        </div>
      </div>

      {/* Main Virtual Consultation Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left Column: Video Stage & Controls (8 cols if chat is open, 12 cols if chat is closed) */}
        <div className={`space-y-3 transition-all duration-300 ${isChatOpen ? "xl:col-span-8" : "xl:col-span-12"}`}>
          {isCallActive ? (
            <>
              {/* Primary Video Call Stage Component */}
              <VideoCallStage
                consultation={currentSession}
                doctorName={doctor.name}
                isMuted={isMuted}
                isCameraOff={isCameraOff}
                isScreenSharing={isScreenSharing}
                activeScreenSharePreset={activeScreenSharePreset}
                onSelectScreenSharePreset={(id) => setActiveScreenSharePreset(id)}
                onStopScreenSharing={() => setIsScreenSharing(false)}
                layoutMode={layoutMode}
                showVitalsHud={showVitalsHud}
                callDurationSeconds={callDurationSeconds}
                patientCameraSimulated={patientCameraSimulated}
                onTogglePatientCamera={() => setPatientCameraSimulated(!patientCameraSimulated)}
              />

              {/* Bottom Docked Floating AV Controls Bar */}
              <CallControlsBar
                isMuted={isMuted}
                onToggleMute={() => setIsMuted(!isMuted)}
                isCameraOff={isCameraOff}
                onToggleCamera={() => setIsCameraOff(!isCameraOff)}
                isScreenSharing={isScreenSharing}
                onToggleScreenShare={() => setIsScreenSharing(!isScreenSharing)}
                layoutMode={layoutMode}
                onChangeLayout={(mode) => setLayoutMode(mode)}
                showVitalsHud={showVitalsHud}
                onToggleVitalsHud={() => setShowVitalsHud(!showVitalsHud)}
                isChatOpen={isChatOpen}
                onToggleChat={() => setIsChatOpen(!isChatOpen)}
                isFullscreen={isFullscreen}
                onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
                onOpenRxModal={() => setIsQuickRxModalOpen(true)}
                onEndCall={() => setIsEndCallModalOpen(true)}
                onOpenScreenSharePicker={() => setIsScreenSharePickerOpen(true)}
              />
            </>
          ) : (
            /* Call Ended / Disconnected Screen */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[460px] shadow-xl">
              <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mb-4">
                <PhoneOff className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                Consultation Concluded
              </h3>
              <p className="text-sm text-slate-400 max-w-md mb-6">
                The virtual session with <strong className="text-slate-200">{currentSession.patientName}</strong> has completed. All clinical SOAP notes and telemetry logs have been committed to the patient chart.
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  id="btn-rejoin-call"
                  onClick={handleStartCall}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Resume Video Call</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsQuickRxModalOpen(true)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2"
                >
                  <FileSignature className="w-4 h-4 text-emerald-400" />
                  <span>Issue Follow-up Rx</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Chat & Clinical Notes Sidebar (4 cols) */}
        {isChatOpen && (
          <div className="xl:col-span-4 h-[590px] sm:h-[650px] lg:h-[690px]">
            <ConsultationChatSidebar
              consultation={currentSession}
              doctorName={doctor.name}
              onOpenRxModal={() => setIsQuickRxModalOpen(true)}
              onClose={() => setIsChatOpen(false)}
            />
          </div>
        )}
      </div>

      {/* Appointment Queue Switcher */}
      <TelemedicineQueue
        activeSessionId={currentSession.id}
        onSelectSession={handleSelectSessionFromQueue}
      />

      {/* Screen Share Preset Selection Modal */}
      <ScreenSharePickerModal
        isOpen={isScreenSharePickerOpen}
        onClose={() => setIsScreenSharePickerOpen(false)}
        onSelectAndStartShare={(presetId) => {
          setActiveScreenSharePreset(presetId);
          setIsScreenSharing(true);
        }}
      />

      {/* End Consultation Confirmation Modal */}
      <EndConsultationModal
        isOpen={isEndCallModalOpen}
        onClose={() => setIsEndCallModalOpen(false)}
        onConfirmEnd={handleConfirmEndCall}
        onOpenRxModal={() => setIsQuickRxModalOpen(true)}
        consultation={currentSession}
        callDurationSeconds={callDurationSeconds}
      />

      {/* Quick E-Prescription Dispatch Modal from within Call */}
      {isQuickRxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in select-none">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <FileSignature className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Draft In-Consultation E-Prescription
                  </h3>
                  <p className="text-xs text-slate-500">
                    Immediate WhatsApp & SMS script delivery for {currentSession.patientName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickRxModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueQuickRx} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Selected Patient & Indication
                </label>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 flex items-center justify-between">
                  <span className="font-bold">{currentSession.patientName} ({currentSession.patientAge}y)</span>
                  <span className="text-slate-500 font-mono">ICD-10: I10.9 (Hypertension)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prescribed Medication & Dosage
                </label>
                <input
                  type="text"
                  defaultValue="Amlodipine 5mg (Oral Daily Tablet)"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sig / Directions
                  </label>
                  <input
                    type="text"
                    defaultValue="Take 1 tablet daily with water"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Repeats / Refills
                  </label>
                  <select
                    defaultValue="3"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-teal-500"
                  >
                    <option value="1">1 Repeat (60 days)</option>
                    <option value="2">2 Repeats (90 days)</option>
                    <option value="3">3 Repeats (180 days)</option>
                    <option value="5">5 Repeats (Chronic)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Doctor signature key ECDSA-256 is unlocked. Script will be signed and delivered instantly.
                </span>
              </div>

              {rxSuccessNotice && (
                <div className="p-3 bg-teal-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Prescription signed and dispatched via WhatsApp to {currentSession.patientName}!</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuickRxModalOpen(false);
                      onNavigate("prescriptions");
                    }}
                    className="text-xs text-teal-700 hover:text-teal-900 font-semibold"
                  >
                    Open Full Prescription Engine →
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsQuickRxModalOpen(false)}
                    className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="btn-confirm-issue-rx"
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    Sign & Dispatch Script
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
