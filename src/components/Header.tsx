import React from 'react';
import {
  Plus,
  Scale,
  BookOpen,
  Download,
  FileDown,
  Palette,
  FolderOpen,
  ShieldCheck,
  Smartphone,
  Monitor
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { MinisterialDecision } from '../types/decision';
import { LaborLawInfo } from '../data/laborLawData';
import { useTheme } from '../context/ThemeContext';
import { useUserAccess } from '../context/UserAccessContext';

interface HeaderProps {
  onAddNew: () => void;
  onOpenLawGuide: () => void;
  onOpenBackup: () => void;
  onOpenLaborLaw: () => void;
  onOpenSyncModal?: () => void;
  onOpenThemeSelector: () => void;
  onOpenDocumentLibrary: () => void;
  onOpenUserAccessModal: () => void;
  onOpenApkModal?: () => void;
  effectiveMode?: 'mobile' | 'desktop';
  onToggleDeviceMode?: () => void;
  totalDecisionsCount: number;
  decisions?: MinisterialDecision[];
  law?: LaborLawInfo | null;
}

export const Header: React.FC<HeaderProps> = ({
  onAddNew,
  onOpenLawGuide,
  onOpenBackup,
  onOpenLaborLaw,
  onOpenSyncModal,
  onOpenThemeSelector,
  onOpenDocumentLibrary,
  onOpenUserAccessModal,
  onOpenApkModal,
  effectiveMode = 'desktop',
  onToggleDeviceMode,
  totalDecisionsCount,
  decisions = [],
  law,
}) => {
  const { activeTheme, activeAccent } = useTheme();
  const { currentUser } = useUserAccess();
  const lawTitle = law ? (law.lawNumberTitle || `قانون العمل رقم ${law.lawNumber} لسنة ${law.year}`) : '';

  return (
    <header
      className={`sticky top-0 z-30 ${activeTheme.headerTextClass} border-b border-black/10 dark:border-white/10 backdrop-blur-xl shadow-xs no-print transition-colors duration-200 specular-border-t`}
      style={{ backgroundColor: 'var(--theme-header-bg)' }}
    >
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between gap-2 sm:gap-3 h-16">
          {/* Brand Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center shadow-xs transition-transform hover:scale-105 shrink-0"
              style={{
                backgroundColor: `${activeAccent.colorHex}22`,
                borderColor: `${activeAccent.colorHex}55`,
                color: activeAccent.colorHex,
                boxShadow: `0 0 14px -1px ${activeAccent.colorHex}35`,
              }}
            >
              <Scale className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <a href="/" className="flex flex-col text-right group">
              <span className="text-xs sm:text-sm md:text-base font-black tracking-tight text-white group-hover:opacity-90 transition-opacity whitespace-nowrap">
                المنظومة الوطنية للتشريعات
              </span>
              <span className="text-[10px] sm:text-[11px] opacity-70 font-sans -mt-0.5 hidden xs:inline truncate max-w-[170px] sm:max-w-xs">
                {law ? lawTitle : 'القرارات واللوائح الوزارية'}
              </span>
            </a>
          </div>

          {/* Navigation Links (Desktop & Tablets) */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold">
            <a
              href="#decisions-catalog"
              className="px-3 py-1.5 rounded-lg hover:bg-white/10 text-white/90 hover:text-white transition-colors"
            >
              دليل التشريعات ({totalDecisionsCount})
            </a>

            {law ? (
              <button
                type="button"
                onClick={onOpenLaborLaw}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 text-sky-300 hover:text-sky-200 transition-colors cursor-pointer"
                title="عرض نص قانون العمل (Word + PDF)"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>قانون العمل</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenSyncModal || onOpenLaborLaw}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>رفع نص القانون</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenLawGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 text-white/90 hover:text-white transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 opacity-70" />
              <span>أبواب القانون</span>
            </button>

            <button
              type="button"
              onClick={onOpenBackup}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              title="النسخ الاحتياطي وتصدير البيانات"
            >
              <Download className="w-3.5 h-3.5 opacity-70" />
              <span>النسخ الاحتياطي</span>
            </button>
          </nav>

          {/* Action Tools Cluster (Fully responsive with >=44px touch targets on mobile) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Smart Document Library Shortcut */}
            <button
              type="button"
              onClick={onOpenDocumentLibrary}
              className="min-h-[38px] flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
              title="مكتبة المستندات والرفع الذكي"
            >
              <FolderOpen className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="hidden md:inline">المكتبة الذكية</span>
            </button>

            {/* User Permissions Button */}
            <button
              type="button"
              onClick={onOpenUserAccessModal}
              className="min-h-[38px] flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-950/60 hover:bg-amber-900/70 text-amber-300 text-xs font-bold transition-colors cursor-pointer shadow-xs active:scale-95"
              title={`المستخدم الحالي: ${currentUser.name} (كامل الصلاحيات)`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="hidden xl:inline">الصلاحيات</span>
            </button>

            {/* Theme Selector */}
            <button
              type="button"
              onClick={onOpenThemeSelector}
              className="min-h-[38px] flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
              title="تغيير ألوان المظهر والوضع الليلي (10 طرازات لحماية العين)"
            >
              <Palette className="w-4 h-4 shrink-0" style={{ color: activeAccent.colorHex }} />
              <span className="hidden sm:inline">ألوان المظهر</span>
            </button>

            {/* Device Mode Switcher (Mobile Streamlined vs Desktop Workspace) */}
            {onToggleDeviceMode && (
              <button
                type="button"
                onClick={onToggleDeviceMode}
                className="min-h-[38px] flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-white/15 bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-all cursor-pointer shadow-xs active:scale-95"
                title={
                  effectiveMode === 'mobile'
                    ? 'التبديل إلى نسخة الحاسب والتابلت الكاملة'
                    : 'التبديل إلى النسخة الميسرة للهواتف الذكية'
                }
              >
                {effectiveMode === 'mobile' ? (
                  <>
                    <Monitor className="w-4 h-4 text-amber-300 shrink-0" />
                    <span className="hidden md:inline font-bold text-amber-200">واجهة الحاسب</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span className="hidden md:inline font-bold text-emerald-200">نسخة الموبايل</span>
                  </>
                )}
              </button>
            )}

            {/* Install PWA */}
            <PWAInstallButton decisions={decisions} law={law} />
          </div>
        </div>
      </div>
    </header>
  );
};
