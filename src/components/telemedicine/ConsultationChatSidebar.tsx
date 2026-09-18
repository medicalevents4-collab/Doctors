import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  FileText,
  Activity,
  Send,
  Paperclip,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  User,
  Heart,
  ShieldCheck,
  Copy,
  Plus
} from "lucide-react";
import { TelemedicineConsultation, TelemedicineChatMessage } from "../../types";

interface ConsultationChatSidebarProps {
  consultation: TelemedicineConsultation;
  doctorName: string;
  onOpenRxModal: () => void;
  onClose?: () => void;
}

const INITIAL_MESSAGES: TelemedicineChatMessage[] = [
  {
    id: "msg-1",
    sender: "system",
    senderName: "ACTIVITY Security Core",
    timestamp: "10:00 AM",
    text: "WebRTC peer connection established. End-to-end encryption enabled (AES-256 GCM). All telemetry and clinical messages comply with POPIA & National Health Act.",
  },
  {
    id: "msg-2",
    sender: "patient",
    senderName: "James Miller",
    timestamp: "10:01 AM",
    text: "Good morning Dr. Chen. I've been having that slight tightness in my chest when climbing stairs, and my home blood pressure was 138/86 this morning.",
  },
  {
    id: "msg-3",
    sender: "doctor",
    senderName: "Dr. Sarah Chen, MD",
    timestamp: "10:02 AM",
    text: "Good morning, James. Thank you for logging your home readings. I've pulled up your continuous 12-lead ECG telemetry and lab chemistry on my screen. How long has the chest tightness lasted?",
  },
];

const CLINICAL_SNIPPETS = [
  "Can you describe where the tightness radiates?",
  "Let me share your recent ECG strip on screen now.",
  "Your blood pressure is slightly elevated at 138/86 mmHg.",
  "I am sending an e-prescription renewal to your WhatsApp now.",
  "Please take a slow, deep breath while I observe your rhythm.",
];

export const ConsultationChatSidebar: React.FC<ConsultationChatSidebarProps> = ({
  consultation,
  doctorName,
  onOpenRxModal,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"chat" | "soap" | "vitals">("chat");
  const [messages, setMessages] = useState<TelemedicineChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // SOAP Clinical Note states
  const [soapSubjective, setSoapSubjective] = useState(
    "Patient reports mild exertional retrosternal chest tightness over past 48 hours. No orthopnea or paroxysmal nocturnal dyspnea. Home BP logs average 136-140 mmHg systolic."
  );
  const [soapObjective, setSoapObjective] = useState(
    "Appearance: Alert, comfortable at rest. Telemetry: Normal Sinus Rhythm at 74 bpm, no ST segment elevation or T wave inversion. Vitals: BP 138/86 mmHg, SpO2 98%, Temp 36.7°C."
  );
  const [soapAssessment, setSoapAssessment] = useState(
    "Essential Hypertension (I10.9) - Marginally elevated systolic. Exertional tightness likely musculoskeletal vs early ischemic angina (low pre-test probability, reassuring telemetry)."
  );
  const [soapPlan, setSoapPlan] = useState(
    "1. Continue Amlodipine 5mg Daily.\n2. Order Exercise Stress ECG & Lipid Profile.\n3. Digital e-prescription issued with WhatsApp delivery.\n4. Telemedicine follow-up in 14 days."
  );
  const [noteSaved, setNoteSaved] = useState(false);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeTab]);

  const handleSendMessage = (textToSend?: string) => {
    const content = textToSend || inputText;
    if (!content.trim()) return;

    const newMsg: TelemedicineChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "doctor",
      senderName: doctorName,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: content.trim(),
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInputText("");

    // Simulate realistic patient reply after 1.2 seconds
    setTimeout(() => {
      const patientResponses = [
        "Yes doctor, the tightness usually resolves within 2 to 3 minutes of resting.",
        "Understood! I take the Amlodipine every morning right after breakfast.",
        "Thank you Dr. Chen, I can see the ECG clearly on my screen now.",
        "That's a relief about the rhythm. I will pick up the prescription once it arrives on WhatsApp.",
        "Yes, I will record my morning and evening blood pressure for the next week as requested.",
      ];
      const randomResponse =
        patientResponses[Math.floor(Math.random() * patientResponses.length)];

      const patientReply: TelemedicineChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "patient",
        senderName: consultation.patientName,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: randomResponse,
      };

      setMessages((prev) => [...prev, patientReply]);
    }, 1200);
  };

  const handleShareLabAttachment = () => {
    const attachMsg: TelemedicineChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "doctor",
      senderName: doctorName,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: "I have attached your official verified Pathology Blood Chemistry & Renal Function panel for your records.",
      attachment: {
        type: "document",
        title: "Comprehensive-Metabolic-Panel-NHLS.pdf",
        subtitle: "Serum Creatinine: 92 µmol/L • eGFR: 88 mL/min (Signed)",
      },
    };
    setMessages((prev) => [...prev, attachMsg]);
  };

  const handleSaveSoapNote = () => {
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 3000);
  };

  const handleAiPrefillNote = () => {
    setSoapSubjective(
      `Patient ${consultation.patientName} (${consultation.patientAge}y ${consultation.patientGender}) attended encrypted virtual review. Chief complaint: "${consultation.chiefComplaint}". Compliant with chronic therapy. No palpitations or syncope.`
    );
    setSoapObjective(
      `Examined via HD video: Well-perfused, speaking in full sentences. Telemetry: Sinus rhythm, HR ${consultation.vitals.heartRate} bpm. Vitals: BP ${consultation.vitals.bloodPressure}, SpO2 ${consultation.vitals.spo2}%, Temp ${consultation.vitals.temperature}.`
    );
    setSoapAssessment(
      `Primary: ${consultation.chronicConditions.join(" & ")}. Stable clinical presentation under chronic maintenance therapy.`
    );
    setSoapPlan(
      `1. Maintain medication compliance.\n2. Reissue chronic digital prescription with cryptographic verification.\n3. Routine blood pressure log follow-up via patient portal.`
    );
  };

  return (
    <div className="w-full h-full bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl select-none">
      {/* Sidebar Header Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-2 pt-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-xl text-xs font-semibold border-b-2 transition-all ${
              activeTab === "chat"
                ? "text-teal-300 border-teal-400 bg-slate-900"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Consultation Chat</span>
            <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] flex items-center justify-center text-slate-300">
              {messages.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("soap")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-xl text-xs font-semibold border-b-2 transition-all ${
              activeTab === "soap"
                ? "text-teal-300 border-teal-400 bg-slate-900"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>SOAP Notes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("vitals")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-xl text-xs font-semibold border-b-2 transition-all ${
              activeTab === "vitals"
                ? "text-teal-300 border-teal-400 bg-slate-900"
                : "text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Patient Info</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CONSULTATION CHAT */}
      {activeTab === "chat" && (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-900/60">
          {/* Quick Clinical Snippet Suggestions */}
          <div className="p-2 border-b border-slate-800 bg-slate-950/40 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
            <span className="text-[10px] text-slate-400 uppercase font-semibold shrink-0 ml-1">
              Quick:
            </span>
            {CLINICAL_SNIPPETS.map((snippet, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(snippet)}
                className="shrink-0 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700/60 transition-colors truncate max-w-[200px]"
                title={snippet}
              >
                {snippet}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg) => {
              if (msg.sender === "system") {
                return (
                  <div
                    key={msg.id}
                    className="p-2 bg-slate-950/80 border border-slate-800 rounded-xl text-[11px] text-slate-400 leading-relaxed flex items-start gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-300 block mb-0.5">
                        {msg.senderName}
                      </span>
                      <span>{msg.text}</span>
                    </div>
                  </div>
                );
              }

              const isMe = msg.sender === "doctor";

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                    <span className="font-semibold text-slate-300">{msg.senderName}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                      isMe
                        ? "bg-teal-700 text-white rounded-tr-xs"
                        : "bg-slate-800 text-slate-200 rounded-tl-xs border border-slate-700/80"
                    }`}
                  >
                    <p>{msg.text}</p>

                    {/* Attachment Card if present */}
                    {msg.attachment && (
                      <div className="mt-2 p-2.5 bg-slate-900/90 rounded-xl border border-slate-700 flex items-center gap-2.5 text-left">
                        <div className="p-2 bg-teal-950 text-teal-300 rounded-lg shrink-0">
                          <FileCheck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-white text-[11px] truncate">
                            {msg.attachment.title}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {msg.attachment.subtitle}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Message Input Footer */}
          <div className="p-3 bg-slate-950/90 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShareLabAttachment}
                title="Send Verified Pathology Lab Report Attachment"
                className="p-2 text-slate-400 hover:text-teal-300 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700 transition-colors shrink-0"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                id="telemedicine-chat-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
                placeholder="Type a clinical instruction or message..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-teal-500"
              />

              <button
                type="button"
                id="btn-send-telemedicine-chat"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className="p-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white rounded-xl transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SOAP CLINICAL NOTES */}
      {activeTab === "soap" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                In-Consultation SOAP Notes
              </h4>
              <p className="text-[11px] text-slate-400">
                Direct write-in for Electronic Medical Record
              </p>
            </div>

            <button
              type="button"
              id="btn-ai-prefill-soap"
              onClick={handleAiPrefillNote}
              className="flex items-center gap-1 px-2.5 py-1 bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-700/60 rounded-lg text-xs font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>AI Pre-fill</span>
            </button>
          </div>

          <div className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-teal-400 mb-1">
                S — Subjective (Patient Complaints & History)
              </label>
              <textarea
                value={soapSubjective}
                onChange={(e) => setSoapSubjective(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-hidden focus:border-teal-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-emerald-400 mb-1">
                O — Objective (Exam, Video Observations, Vitals)
              </label>
              <textarea
                value={soapObjective}
                onChange={(e) => setSoapObjective(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-hidden focus:border-teal-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-amber-400 mb-1">
                A — Assessment (Differential & ICD-10 Coding)
              </label>
              <textarea
                value={soapAssessment}
                onChange={(e) => setSoapAssessment(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-hidden focus:border-teal-500 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-indigo-400 mb-1">
                P — Plan (Prescriptions, Diagnostics, Follow-up)
              </label>
              <textarea
                value={soapPlan}
                onChange={(e) => setSoapPlan(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-hidden focus:border-teal-500 leading-relaxed"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <button
              type="button"
              onClick={onOpenRxModal}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Attach E-Prescription
            </button>

            <button
              type="button"
              id="btn-save-soap-note"
              onClick={handleSaveSoapNote}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                noteSaved
                  ? "bg-emerald-600 text-white"
                  : "bg-teal-600 hover:bg-teal-500 text-white shadow-sm"
              }`}
            >
              {noteSaved ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Saved to EHR!</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  <span>Save to Patient Chart</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: PATIENT BACKGROUND & VITALS */}
      {activeTab === "vitals" && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900">
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-teal-900 text-teal-300 font-bold flex items-center justify-center">
                JM
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{consultation.patientName}</h4>
                <p className="text-xs text-slate-400">
                  MRN: {consultation.patientMrn} • Age: {consultation.patientAge}
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-1 pt-2 border-t border-slate-800">
              <div>
                <span className="text-slate-400">Chief Complaint:</span> {consultation.chiefComplaint}
              </div>
            </div>
          </div>

          {/* Vitals Telemetry Grid */}
          <div>
            <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              Verified Clinical Vitals
            </h5>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Blood Pressure</span>
                <span className="text-sm font-bold text-amber-400 font-mono">
                  {consultation.vitals.bloodPressure}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Mildly elevated</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Heart Rate</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {consultation.vitals.heartRate} bpm
                </span>
                <span className="text-[10px] text-emerald-400 block mt-0.5">Normal Sinus</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Oxygen Sat (SpO₂)</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {consultation.vitals.spo2}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Room air</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Body Temperature</span>
                <span className="text-sm font-bold text-slate-200 font-mono">
                  {consultation.vitals.temperature}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Afebrile</span>
              </div>
            </div>
          </div>

          {/* Allergy Warning Alert */}
          <div className="p-3 bg-rose-950/40 rounded-xl border border-rose-900/60">
            <h5 className="text-xs font-bold text-rose-300 flex items-center gap-1.5 mb-1">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              Allergies & Contraindications
            </h5>
            <p className="text-xs text-rose-200">
              {consultation.allergies.join(", ") || "No documented allergies"}
            </p>
          </div>

          {/* Chronic Diagnoses */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <h5 className="text-xs font-bold text-slate-300 mb-1.5">Chronic Diagnoses</h5>
            <div className="space-y-1">
              {consultation.chronicConditions.map((cond, i) => (
                <div key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                  <span>{cond}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
