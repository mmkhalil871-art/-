import React from 'react';
import { Plus, Scale, BookOpen, Download, FileDown } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { MinisterialDecision } from '../types/decision';
import { LaborLawInfo } from '../data/laborLawData';

interface HeaderProps {
  onAddNew: () => void;
  onOpenLawGuide: () => void;
  onOpenBackup: () => void;
  onOpenLaborLaw: () => void;
  onOpenSyncModal?: () => void;
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
  totalDecisionsCount,
  decisions = [],
  law,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
            <a href="/" className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap hover:text-amber-300 transition-colors">
              قاعدة القرارات الوزارية · قانون العمل 14 لسنة 2025
            </a>
          </div>

          {/* Zone 2: Concise Nav Links */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-stone-300">
            <button
              type="button"
              onClick={onOpenLaborLaw}
              className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer font-bold hover:underline"
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

            <a href="#decisions-catalog" className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0">
              دليل القرارات ({totalDecisionsCount})
            </a>
            <button
              type="button"
              onClick={onOpenLawGuide}
              className="flex items-center gap-1.5 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer text-stone-300 hover:underline"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>أبواب القانون</span>
            </button>
            <button
              type="button"
              onClick={onOpenBackup}
              className="flex items-center gap-1.5 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer text-stone-300 hover:underline"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>النسخ الاحتياطي</span>
            </button>
          </nav>

          {/* Zone 3: Install & Add Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Install PWA Button on PC / Mobile */}
            <PWAInstallButton decisions={decisions} law={law} />

            {/* Primary Action: Add Decision */}
            <button
              type="button"
              onClick={onAddNew}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة قرار جديد</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
