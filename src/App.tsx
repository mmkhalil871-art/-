import React, { useState, useEffect, useMemo } from 'react';
import {
  MinisterialDecision,
  ViewMode
} from './types/decision';
import {
  getStoredDecisions,
  saveDecisions,
  deleteDecisionsWithoutPdf,
  resetToSeedDecisions
} from './utils/storage';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { FilterBar } from './components/FilterBar';
import { DecisionCard } from './components/DecisionCard';
import { DecisionTable } from './components/DecisionTable';
import { DecisionViewModal } from './components/DecisionViewModal';
import { DecisionFormModal } from './components/DecisionFormModal';
import { LawArticlesGuideModal } from './components/LawArticlesGuideModal';
import { BackupModal } from './components/BackupModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallModal } from './components/PWAInstallModal';
import { LaborLawModal } from './components/LaborLawModal';
import { LaborLawBanner } from './components/LaborLawBanner';
import { LawUploadAndSyncModal } from './components/LawUploadAndSyncModal';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { DocumentLibraryModal } from './components/DocumentLibraryModal';
import { UserAccessModal } from './components/UserAccessModal';
import { MobileDecisionCard } from './components/MobileDecisionCard';
import { MobileBottomDock } from './components/MobileBottomDock';
import { AndroidApkModal } from './components/AndroidApkModal';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { UserAccessProvider, useUserAccess } from './context/UserAccessContext';
import { DeviceModeProvider, useDeviceMode } from './context/DeviceModeContext';
import { LaborLawInfo } from './data/laborLawData';
import { getStoredLaborLaw, saveStoredLaborLaw, deleteStoredLaborLaw } from './utils/lawStorage';
import {
  Scale,
  Plus,
  FolderOpen,
  CheckCircle2,
  WifiOff,
  Palette,
  ShieldCheck,
  Shield,
  Smartphone
} from 'lucide-react';

function MainDashboard() {
  const { activeTheme, activeAccent } = useTheme();
  const { currentUser, isSuperAdmin, canEditTexts, canAddDocuments, canDelete, canManageUsers } = useUserAccess();
  const { effectiveMode, toggleMode, isMobile } = useDeviceMode();

  const [decisions, setDecisions] = useState<MinisterialDecision[]>([]);
  const [currentLaw, setCurrentLaw] = useState<LaborLawInfo | null>(getStoredLaborLaw());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('جميع التصنيفات');
  const [selectedStatus, setSelectedStatus] = useState('الكل');
  const [selectedYear, setSelectedYear] = useState('الكل');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Modals state
  const [activeViewingDecision, setActiveViewingDecision] =
    useState<MinisterialDecision | null>(null);
  const [decisionModalInitialTab, setDecisionModalInitialTab] = useState<
    'scanned_pdf' | 'written_text' | 'summary' | 'split'
  >('summary');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDecision, setEditingDecision] =
    useState<MinisterialDecision | null>(null);
  const [isLawGuideOpen, setIsLawGuideOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [isLaborLawModalOpen, setIsLaborLawModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isDocumentLibraryOpen, setIsDocumentLibraryOpen] = useState(false);
  const [isUserAccessModalOpen, setIsUserAccessModalOpen] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Delete all decisions that do not have an official PDF copy as requested by the user
    const cleaned = deleteDecisionsWithoutPdf();
    setDecisions(cleaned);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteNonPdfDecisions = () => {
    const cleaned = deleteDecisionsWithoutPdf();
    const removedCount = decisions.length - cleaned.length;
    setDecisions(cleaned);
    showToast(`تم حذف ${removedCount} قرار لا يملك مستند PDF نسخة رسمية.`);
  };

  const nonPdfCount = decisions.filter((d) => !d.pdfAttachment).length;

  // Filtered decisions list
  const filteredDecisions = useMemo(() => {
    return decisions.filter((item) => {
      // Category filter
      if (
        selectedCategory !== 'جميع التصنيفات' &&
        item.category !== selectedCategory
      ) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'الكل' && item.status !== selectedStatus) {
        return false;
      }

      // Year filter
      if (selectedYear !== 'الكل' && String(item.year) !== selectedYear) {
        return false;
      }

      // Favorites
      if (showOnlyFavorites && !item.isFavorite) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const numMatch = item.decisionNumber.toLowerCase().includes(query);
        const titleMatch = item.title.toLowerCase().includes(query);
        const refMatch = item.officialReference.toLowerCase().includes(query);
        const lawArticlesMatch = item.relatedLawArticles?.some((art) =>
          art.toLowerCase().includes(query)
        );
        const tagsMatch = item.tags?.some((t) =>
          t.toLowerCase().includes(query)
        );
        const articlesMatch = item.articles?.some(
          (art) =>
            art.articleNumber.toLowerCase().includes(query) ||
            art.title?.toLowerCase().includes(query) ||
            art.content.toLowerCase().includes(query)
        );
        const preambleMatch = item.preamble.toLowerCase().includes(query);

        if (
          !numMatch &&
          !titleMatch &&
          !refMatch &&
          !lawArticlesMatch &&
          !tagsMatch &&
          !articlesMatch &&
          !preambleMatch
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    decisions,
    searchQuery,
    selectedCategory,
    selectedStatus,
    selectedYear,
    showOnlyFavorites,
  ]);

  const handleSaveDecision = (savedDecision: MinisterialDecision) => {
    let updated: MinisterialDecision[];
    const exists = decisions.some((d) => d.id === savedDecision.id);

    if (exists) {
      updated = decisions.map((d) =>
        d.id === savedDecision.id ? savedDecision : d
      );
      showToast(
        `تم تعديل القرار الوزاري رقم (${savedDecision.decisionNumber}) لسنة ${savedDecision.year} بنجاح.`
      );
    } else {
      updated = [savedDecision, ...decisions];
      showToast(
        `تمت إضافة القرار الوزاري رقم (${savedDecision.decisionNumber}) لسنة ${savedDecision.year} إلى القاعدة بنجاح.`
      );
    }

    setDecisions(updated);
    saveDecisions(updated);
    setEditingDecision(null);
  };

  const handleDeleteDecision = (id: string) => {
    const updated = decisions.filter((d) => d.id !== id);
    setDecisions(updated);
    saveDecisions(updated);
    showToast('تم حذف القرار من قاعدة البيانات بنجاح.');
    if (activeViewingDecision?.id === id) {
      setActiveViewingDecision(null);
    }
  };

  const handleToggleFavorite = (id: string) => {
    const updated = decisions.map((d) =>
      d.id === id ? { ...d, isFavorite: !d.isFavorite } : d
    );
    setDecisions(updated);
    saveDecisions(updated);

    if (activeViewingDecision?.id === id) {
      setActiveViewingDecision((prev) =>
        prev ? { ...prev, isFavorite: !prev.isFavorite } : null
      );
    }
  };

  const handleResetToDefault = () => {
    const resetList = resetToSeedDecisions();
    setDecisions(resetList);
    showToast('تمت استعادة كافة القرارات الوزارية الافتراضية المعتمدة.');
  };

  const handleImportDecisions = (importedList: MinisterialDecision[]) => {
    setDecisions(importedList);
    saveDecisions(importedList);
    showToast(`تم تحديث قاعدة البيانات بـ ${importedList.length} قرار وزاري.`);
  };

  const handlePrintDirect = (decision: MinisterialDecision) => {
    setActiveViewingDecision(decision);
    setDecisionModalInitialTab('written_text');
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const handleViewDecision = (
    decision: MinisterialDecision,
    initialTab: 'scanned_pdf' | 'written_text' | 'summary' | 'split' = 'summary'
  ) => {
    setActiveViewingDecision(decision);
    setDecisionModalInitialTab(initialTab);
  };

  const handleLawUpdated = (newLaw: LaborLawInfo) => {
    setCurrentLaw(newLaw);
    saveStoredLaborLaw(newLaw);
    showToast('تم استبدال نص قانون العمل وتحديثه في التطبيق بنجاح.');
  };

  const handleDeleteLaw = () => {
    deleteStoredLaborLaw();
    setCurrentLaw(null);
    showToast('تم حذف قانون العمل بنجاح. بانتظار رفع نسختك المعتمدة.');
  };

  const handleDecisionsUpdated = (updatedList: MinisterialDecision[]) => {
    setDecisions(updatedList);
    saveDecisions(updatedList);
    showToast('تم تنظيم وتحديث قاعدة بيانات القرارات الوزارية بنجاح.');
  };

  const isFilterActive =
    searchQuery !== '' ||
    selectedCategory !== 'جميع التصنيفات' ||
    selectedStatus !== 'الكل' ||
    selectedYear !== 'الكل' ||
    showOnlyFavorites;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('جميع التصنيفات');
    setSelectedStatus('الكل');
    setSelectedYear('الكل');
    setShowOnlyFavorites(false);
  };

  return (
    <div
      className={`min-h-screen ${activeTheme.bodyBgClass} ${activeTheme.textPrimaryClass} flex flex-col font-cairo transition-colors duration-200`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm animate-fade-in border border-stone-700 no-print">
          <CheckCircle2
            className="w-4 h-4 shrink-0"
            style={{ color: activeAccent.colorHex }}
          />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        onAddNew={() => {
          setEditingDecision(null);
          setIsFormOpen(true);
        }}
        onOpenLawGuide={() => setIsLawGuideOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenLaborLaw={() => setIsLaborLawModalOpen(true)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenThemeSelector={() => setIsThemeModalOpen(true)}
        onOpenDocumentLibrary={() => setIsDocumentLibraryOpen(true)}
        onOpenUserAccessModal={() => setIsUserAccessModalOpen(true)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        effectiveMode={effectiveMode}
        onToggleDeviceMode={toggleMode}
        totalDecisionsCount={decisions.length}
        decisions={decisions}
        law={currentLaw}
      />

      {/* Hero Strip with Institutional Notice */}
      {/* Executive Hero Section */}
      <section
        className={`py-8 px-4 sm:px-6 lg:px-8 border-b border-black/15 dark:border-white/10 no-print transition-colors duration-200 ${
          activeTheme.isDark
            ? 'bg-zinc-950 text-zinc-100'
            : activeTheme.id === 'navy'
            ? 'bg-slate-950 text-white'
            : activeTheme.id === 'emerald'
            ? 'bg-[#052e23] text-emerald-50'
            : activeTheme.id === 'parchment'
            ? 'bg-[#271c14] text-amber-50'
            : 'bg-stone-900 text-stone-100'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-xs border border-white/15">
              <Scale className="w-3.5 h-3.5" style={{ color: activeAccent.colorHex }} />
              <span className="text-white/90">جمهورية مصر العربية · المنظومة التشريعية الرسمية</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              قاعدة القرارات واللوائح المنفذة لقانون العمل
            </h1>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-2xl">
              مرجع قانوني رقمي موثق بالنسخ الممسوحة ضوئياً (PDF) والنصوص المكتوبة (Word) لتيسير
              النقل والاقتباس وصياغة المذكرات، مع إمكانية رفع المستندات وتنظيمها آلياً.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {/* Primary Add Legislation */}
            <button
              type="button"
              onClick={() => {
                setEditingDecision(null);
                setIsFormOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4.5 py-2.5 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] cursor-pointer"
              style={{ backgroundColor: activeAccent.colorHex }}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>إضافة تشريع جديد</span>
            </button>

            {/* Smart Document Library & Ingestion Button */}
            <button
              type="button"
              onClick={() => setIsDocumentLibraryOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm transition-all hover:scale-[1.02] cursor-pointer border border-emerald-400/30"
              title="رفع مستندات القرارات وتنظيمها نيابة عنك"
            >
              <FolderOpen className="w-4 h-4 text-emerald-200" />
              <span>مكتبة الوثائق الذكية</span>
            </button>

            {/* Mobile / APK App Launcher */}
            <button
              type="button"
              onClick={() => setIsApkModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm transition-all hover:scale-[1.02] cursor-pointer border border-sky-400/30"
              title="تثبيت تطبيق أندرويد APK للهاتف المحمول"
            >
              <Smartphone className="w-4 h-4 text-sky-200" />
              <span>تطبيق الهاتف (APK)</span>
            </button>

            {/* Offline Launcher */}
            <button
              type="button"
              onClick={() => setIsInstallModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/15 text-white/90 hover:text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer border border-white/15"
              title="خيارات تشغيل المنظومة كبرنامج حاسب آلي بدون إنترنت"
            >
              <WifiOff className="w-4 h-4" />
              <span>بدون إنترنت</span>
            </button>

            {/* Theme Shortcut */}
            <button
              type="button"
              onClick={() => setIsThemeModalOpen(true)}
              className="p-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs transition-colors cursor-pointer border border-white/15"
              title="تخصيص المظهر ودرجات الألوان"
            >
              <Palette className="w-4 h-4" style={{ color: activeAccent.colorHex }} />
            </button>
          </div>
        </div>
      </section>

      {/* Modern Stats Ribbon */}
      <StatsBar decisions={decisions} />

      {/* Unified Executive System Status Ribbon (Minimalist & Clean) */}
      <div
        className={`border-b px-4 sm:px-6 lg:px-8 py-2 text-xs no-print transition-colors ${
          activeTheme.isDark
            ? 'bg-zinc-900/70 border-zinc-800 text-zinc-300'
            : activeTheme.id === 'parchment'
            ? 'bg-[#f4efe4] border-[#e2d7c5] text-[#3d2f23]'
            : 'bg-stone-100/90 border-stone-200/90 text-stone-700'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          {/* Admin User Status */}
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              <strong>المسؤول ({currentUser.name}):</strong> كامل الصلاحيات مفعلة (تحرير النصوص، رفع وتعديل المستندات، الحذف، والتحكم في الدخول)
            </span>
            <button
              type="button"
              onClick={() => setIsUserAccessModalOpen(true)}
              className="font-bold underline text-amber-600 dark:text-amber-400 hover:opacity-80 cursor-pointer mr-1"
            >
              إدارة الصلاحيات
            </button>
          </div>

          {/* Document Ingestion & Integrity Status */}
          <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>كافة التشريعات موثقة بنسخ رسمية (PDF + Word)</span>
            <button
              type="button"
              onClick={() => setIsDocumentLibraryOpen(true)}
              className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>رفع المزيد وتنظيم المكتبة</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        showOnlyFavorites={showOnlyFavorites}
        onToggleFavorites={() => setShowOnlyFavorites(!showOnlyFavorites)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalFiltered={filteredDecisions.length}
        onResetFilters={handleResetFilters}
        isFilterActive={isFilterActive}
        onDeleteNonPdfDecisions={handleDeleteNonPdfDecisions}
        nonPdfCount={nonPdfCount}
      />

      {/* Main Content Area */}
      <main id="decisions-catalog" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full no-print">
        {/* Featured Labor Law 14 Banner with Direct Word & PDF Downloads */}
        <LaborLawBanner
          currentLaw={currentLaw}
          onOpenLawModal={() => setIsLaborLawModalOpen(true)}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
          onDeleteLaw={handleDeleteLaw}
        />

        {filteredDecisions.length === 0 ? (
          <div
            className={`rounded-2xl border p-8 sm:p-12 text-center max-w-xl mx-auto my-8 ${
              activeTheme.isDark
                ? 'bg-zinc-850 border-zinc-700'
                : activeTheme.id === 'parchment'
                ? 'bg-[#fffdf9] border-[#e4d7c5]'
                : 'bg-white border-stone-200'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-bold mb-1.5">
              تم حذف كافة القرارات التي لا يوجد لها مستند PDF نسخة رسمية
            </h3>
            <p className="text-xs opacity-80 mb-5 leading-relaxed max-w-md mx-auto">
              تم تطبيق قاعدة الحصر والتوثيق الرسمي: أصبحت مكتبة القرارات مقتصرة حصراً على القرارات الموثقة المرفق بها نسخة رسمية ممسوحة ضوئياً (PDF).
              يمكنك الآن رفع مستندات القرارات وسيتولى المحرك الذكي تنظيمها وتصنيفها وربطها بمواد قانون العمل 14 تلقائياً.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDocumentLibraryOpen(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                <span>فتح مكتبة المستندات ورفع النسخ الرسمية (PDF) 📁</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingDecision(null);
                  setIsFormOpen(true);
                }}
                className="px-4 py-2.5 bg-black/5 dark:bg-white/10 hover:opacity-100 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                + إضافة تشريع جديد مع إرفاق PDF
              </button>
            </div>
          </div>
        ) : effectiveMode === 'mobile' ? (
          <div className="space-y-3.5 pb-20 max-w-2xl mx-auto">
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-xs">
              <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-500" />
                <span>النسخة الميسرة للموبايل ({filteredDecisions.length} تشريع)</span>
              </span>
              <button
                type="button"
                onClick={toggleMode}
                className="text-sky-600 dark:text-sky-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>التبديل لعرض الحاسب والتابلت</span>
              </button>
            </div>
            {filteredDecisions.map((decision) => (
              <MobileDecisionCard
                key={decision.id}
                decision={decision}
                onView={handleViewDecision}
                onPrint={handlePrintDirect}
                onEdit={(d) => {
                  setEditingDecision(d);
                  setIsFormOpen(true);
                }}
                onDelete={handleDeleteDecision}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDecisions.map((decision) => (
              <DecisionCard
                key={decision.id}
                decision={decision}
                onView={handleViewDecision}
                onPrint={handlePrintDirect}
                onEdit={(d) => {
                  setEditingDecision(d);
                  setIsFormOpen(true);
                }}
                onUpdateDecision={handleSaveDecision}
                onDelete={handleDeleteDecision}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <DecisionTable
            decisions={filteredDecisions}
            onView={handleViewDecision}
            onPrint={handlePrintDirect}
            onEdit={(d) => {
              setEditingDecision(d);
              setIsFormOpen(true);
            }}
            onUpdateDecision={handleSaveDecision}
            onDelete={handleDeleteDecision}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
      </main>

      {/* Footer */}
      <footer
        className={`border-t py-8 px-4 sm:px-6 lg:px-8 text-xs no-print transition-colors duration-200 ${
          activeTheme.isDark
            ? 'bg-zinc-950 text-zinc-400 border-zinc-850'
            : activeTheme.id === 'navy'
            ? 'bg-slate-950 text-slate-400 border-slate-900'
            : activeTheme.id === 'emerald'
            ? 'bg-[#04231b] text-emerald-200/70 border-[#073629]'
            : activeTheme.id === 'parchment'
            ? 'bg-[#20160f] text-amber-200/60 border-[#322318]'
            : 'bg-stone-900 text-stone-400 border-stone-800'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4" style={{ color: activeAccent.colorHex }} />
            <span className="font-semibold text-white/90">
              قاعدة بيانات القرارات الوزارية المنفذة لقانون العمل رقم 14 لسنة 2025
            </span>
          </div>
          <div className="opacity-75 text-center sm:text-left flex items-center gap-3">
            <span>نظام قانوني مؤسسي للتوثيق والاستعراض والطباعة الرسمية</span>
            <button
              type="button"
              onClick={() => setIsDocumentLibraryOpen(true)}
              className="hover:underline flex items-center gap-1 cursor-pointer text-emerald-400"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>مكتبة المستندات</span>
            </button>
            <button
              type="button"
              onClick={() => setIsThemeModalOpen(true)}
              className="hover:underline flex items-center gap-1 cursor-pointer"
              style={{ color: activeAccent.colorHex }}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>المظهر</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Decision Detailed View & Print Modal */}
      {activeViewingDecision && (
        <DecisionViewModal
          decision={activeViewingDecision}
          initialTab={decisionModalInitialTab}
          onClose={() => setActiveViewingDecision(null)}
          onEdit={(d) => {
            setActiveViewingDecision(null);
            setEditingDecision(d);
            setIsFormOpen(true);
          }}
          onDelete={handleDeleteDecision}
          onToggleFavorite={handleToggleFavorite}
          onSelectLawArticle={(art) => {
            setActiveViewingDecision(null);
            setSearchQuery(art);
          }}
          onUpdateDecision={(updated) => {
            handleSaveDecision(updated);
            setActiveViewingDecision(updated);
          }}
        />
      )}

      {/* Offline Status Alert */}
      <OfflineIndicator />

      {/* Decision Add/Edit Form Modal */}
      <DecisionFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingDecision(null);
        }}
        onSave={handleSaveDecision}
        initialDecision={editingDecision}
      />

      {/* Law Articles Guide Modal */}
      <LawArticlesGuideModal
        isOpen={isLawGuideOpen}
        onClose={() => setIsLawGuideOpen(false)}
        onSelectCategoryFilter={(cat) => {
          setSelectedCategory(cat);
          setSearchQuery('');
        }}
      />

      {/* Backup and Import Modal */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        decisions={decisions}
        onImportDecisions={handleImportDecisions}
        onResetToDefault={handleResetToDefault}
      />

      {/* Desktop App & PWA Install Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        decisions={decisions}
        law={currentLaw}
      />

      {/* Labor Law Full View & Word/PDF Modal */}
      <LaborLawModal
        isOpen={isLaborLawModalOpen}
        onClose={() => setIsLaborLawModalOpen(false)}
        law={currentLaw}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
      />

      {/* Law Upload, Review & Decisions Cross-Reference Sync Modal */}
      <LawUploadAndSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        currentLaw={currentLaw}
        onLawUpdated={handleLawUpdated}
        decisions={decisions}
        onDecisionsUpdated={handleDecisionsUpdated}
      />

      {/* Theme and Colors Customization Modal */}
      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />

      {/* Document Library & Smart Auto-Organizer Modal */}
      <DocumentLibraryModal
        isOpen={isDocumentLibraryOpen}
        onClose={() => setIsDocumentLibraryOpen(false)}
        decisions={decisions}
        onDecisionsUpdated={handleDecisionsUpdated}
        law={currentLaw}
        onViewDecision={handleViewDecision}
      />

      {/* User Access & Full RBAC Permissions Control Modal */}
      <UserAccessModal
        isOpen={isUserAccessModalOpen}
        onClose={() => setIsUserAccessModalOpen(false)}
        onShowToast={showToast}
      />

      {/* Android APK & WebAPK Hub Modal */}
      <AndroidApkModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />

      {/* Mobile Streamlined Bottom Quick Dock */}
      <MobileBottomDock
        onOpenSearch={() => {
          const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
            searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }}
        onToggleFavorites={() => setShowOnlyFavorites(!showOnlyFavorites)}
        showOnlyFavorites={showOnlyFavorites}
        onOpenLibrary={() => setIsDocumentLibraryOpen(true)}
        onOpenTheme={() => setIsThemeModalOpen(true)}
        onAddNew={() => {
          setEditingDecision(null);
          setIsFormOpen(true);
        }}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        totalCount={decisions.length}
      />
    </div>
  );
}

export default function App() {
  return (
    <DeviceModeProvider>
      <ThemeProvider>
        <UserAccessProvider>
          <MainDashboard />
        </UserAccessProvider>
      </ThemeProvider>
    </DeviceModeProvider>
  );
}
