import React, { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useI18n } from "../../i18n/I18nContext";
import { SupportedLanguage } from "../../i18n/types";

interface LanguageSelectorProps {
  variant?: "header" | "compact" | "cards";
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = "header",
  className = "",
}) => {
  const { language, setLanguage, languages, currentLanguageInfo, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (variant === "cards") {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${className}`}>
        {languages.map((lang) => {
          const isSelected = lang.code === language;
          return (
            <button
              key={lang.code}
              id={`btn-select-lang-${lang.code}`}
              type="button"
              onClick={() => setLanguage(lang.code)}
              className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all duration-150 ${
                isSelected
                  ? "bg-teal-50/70 border-teal-500 text-teal-900 ring-2 ring-teal-500/20 shadow-xs"
                  : "bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <span className="text-xl" role="img" aria-label={lang.name}>
                  {lang.flag}
                </span>
                {isSelected && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3" />
                    <span>{t.common.active}</span>
                  </span>
                )}
              </div>
              <span className="font-bold text-sm tracking-tight text-slate-900">
                {lang.nativeName}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">
                {lang.name} • {lang.region}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        id="btn-header-language-toggle"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t.header.switchLanguage}
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs"
      >
        <span className="text-sm" role="img" aria-label={currentLanguageInfo.name}>
          {currentLanguageInfo.flag}
        </span>
        <span className="font-semibold text-slate-800 uppercase text-[11px] tracking-wide">
          {currentLanguageInfo.code}
        </span>
        <span className="hidden lg:inline text-slate-600 font-medium">
          {currentLanguageInfo.nativeName}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div
          id="dropdown-language-menu"
          className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5 border-b border-slate-100">
            <Globe className="w-3 h-3 text-teal-600" />
            <span>{t.header.switchLanguage}</span>
          </div>

          <div className="p-1 space-y-0.5">
            {languages.map((lang) => {
              const isSelected = lang.code === language;
              return (
                <button
                  key={lang.code}
                  id={`dropdown-lang-item-${lang.code}`}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg transition-colors text-left ${
                    isSelected
                      ? "bg-teal-50 text-teal-900 font-semibold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base" role="img" aria-label={lang.name}>
                      {lang.flag}
                    </span>
                    <div>
                      <div className="leading-tight font-medium">{lang.nativeName}</div>
                      <div className="text-[10px] text-slate-400">{lang.name}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
