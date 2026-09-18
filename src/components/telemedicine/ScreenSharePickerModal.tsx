import React from "react";
import {
  ScreenShare,
  X,
  FileText,
  Heart,
  Activity,
  Layers,
  CheckCircle2,
  Lock
} from "lucide-react";
import { SCREEN_SHARE_PRESETS } from "./ScreenShareStage";

interface ScreenSharePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAndStartShare: (presetId: string) => void;
}

export const ScreenSharePickerModal: React.FC<ScreenSharePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectAndStartShare,
}) => {
  if (!isOpen) return null;

  const getIcon = (category: string) => {
    switch (category) {
      case "radiology":
        return <Layers className="w-5 h-5 text-teal-400" />;
      case "ecg":
        return <Heart className="w-5 h-5 text-rose-400" />;
      case "labs":
        return <Activity className="w-5 h-5 text-amber-400" />;
      case "records":
        return <FileText className="w-5 h-5 text-indigo-400" />;
      default:
        return <ScreenShare className="w-5 h-5 text-teal-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-950 text-indigo-400 rounded-xl border border-indigo-800/60">
              <ScreenShare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Select Clinical Artifact to Share</h3>
              <p className="text-xs text-slate-400">Stream encrypted diagnostic material directly to patient's viewport</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Artifact List */}
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {SCREEN_SHARE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                onSelectAndStartShare(preset.id);
                onClose();
              }}
              className="w-full text-left p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-teal-500/60 rounded-xl transition-all group flex items-start gap-3.5"
            >
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-700 shrink-0 group-hover:border-teal-500/40">
                {getIcon(preset.category)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-white group-hover:text-teal-300 transition-colors truncate">
                    {preset.title}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700 shrink-0">
                    {preset.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Security & Privacy Notice */}
        <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>End-to-End HIPAA/POPIA Redacted Stream</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
