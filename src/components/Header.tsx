import React from 'react';
import { Plus, Scale, BookOpen, Download, FileDown, Palette } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { MinisterialDecision } from '../types/decision';
import { LaborLawInfo } from '../data/laborLawData';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  onAddNew: () => void;
  onOpenLawGuide: () => void;
  onOpenBackup: () => void;
  onOpenLaborLaw: () => void;
  onOpenSyncModal?: () => void;
  onOpenThemeSelector: () => void;
  totalDecisionsCount: number;
  decisions?: MinisterialDecision[];
  law?: LaborLawInfo;
}

export const Header: React.FC<HeaderProps> = ({
  onAddNew,
  onOpenLawGuide,
  onOpenBackup,
  onOpenLaborLaw,
  onOpenSyncModal,
  onOpenThemeSelector,
  totalDecisionsCount,
  decisions = [],
  law,
}) => {
  const { activeTheme, activeAccent } = useTheme();

  return (
    <header
      className={`sticky top-0 z-30 ${activeTheme.headerBgClass} ${activeTheme.headerTextClass} border-b border-black/20 dark:border-white/10 shadow-sm no-print transition-colors duration-200`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 lg:gap-6 h-16">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              className="w-9 h-9 rounded-lg border flex items-center justify-center transition-colors"
              style={{
                backgroundColor: `${activeAccent.colorHex}20`,
                borderColor: `${activeAccent.colorHex}40`,
                color: activeAccent.colorHex,
              }}
            >
              <Scale className="w-5 h-5" />
            </div>
            <a
              href="/"
              className="text-sm sm:text-base lg:text-lg font-bold tracking-tight text-white whitespace-nowrap hover:opacity-90 transition-opacity"
            >
              قاعدة القرارات الوزارية · قانون العمل 14 لسنة 2025
            </a>
          </div>

          {/* Zone 2: Concise Nav Links */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium opacity-90">
            <button
              type="button"
              onClick={onOpenLaborLaw}
              className="flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer font-bold hover:underline"
              style={{ color: activeAccent.colorHex }}
            >
              <FileDown className="w-4 h-4 text-sky-400" />
              <span>قانون العمل 14 (Word + PDF)</span>
            </button>

            {onOpenSyncModal && (
              <button
                type="button"
                onClick={onOpenSyncModal}
                className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer text-xs bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-md"
                title="تحديث واستبدال نص القانون ومراجعة الروابط"
              >
                <span>تحديث نص القانون 🔄</span>
              </button>
            )}

            <a
              href="#decisions-catalog"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              دليل القرارات ({totalDecisionsCount})
            </a>
            <button
              type="button"
              onClick={onOpenLawGuide}
              className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer hover:underline"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>أبواب القانون</span>
            </button>
            <button
              type="button"
              onClick={onOpenBackup}
              className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer hover:underline"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>النسخ الاحتياطي</span>
            </button>
          </nav>

          {/* Zone 3: Theme, Install & Add Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Theme & Appearance Switcher */}
            <button
              type="button"
              onClick={onOpenThemeSelector}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/15 hover:border-white/30 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
              title="تغيير المظهر ودرجات الألوان وحجم الخط"
            >
              <Palette className="w-4 h-4" style={{ color: activeAccent.colorHex }} />
              <span className="hidden md:inline">المظهر والألوان</span>
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: activeAccent.colorHex }}
              />
            </button>

            {/* Install PWA Button on PC / Mobile */}
            <PWAInstallButton decisions={decisions} law={law} />

            {/* Primary Action: Add Decision */}
            <button
              type="button"
              onClick={onAddNew}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-transform active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
              style={{
                backgroundColor: activeAccent.colorHex,
                color: '#ffffff',
              }}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>إضافة قرار جديد</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
