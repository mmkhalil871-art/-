import React, { useState, useEffect, useMemo } from 'react';
import {
  MinisterialDecision,
  ViewMode
} from './types/decision';
import {
  getStoredDecisions,
  saveDecisions,
  resetToSeedDecisions
} from './utils/storage';
import { downloadWindowsDesktopLauncher } from './utils/desktopAppLauncher';
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
import { LaborLawInfo } from './data/laborLawData';
import { getStoredLaborLaw, saveStoredLaborLaw } from './utils/lawStorage';
import {
  Scale,
  Plus,
  BookOpen,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  MonitorDown,
  RefreshCw,
  WifiOff
} from 'lucide-react';

export default function App() {
  const [decisions, setDecisions] = useState<MinisterialDecision[]>([]);
  const [currentLaw, setCurrentLaw] = useState<LaborLawInfo>(getStoredLaborLaw());
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
  const [isLaborLawModalOpen, setIsLaborLawModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const loaded = getStoredDecisions();
    setDecisions(loaded);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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
    showToast('تم استبدال نص قانون العمل رقم 14 وتحديثه في التطبيق بنجاح.');
  };

  const handleDecisionsUpdated = (updatedList: MinisterialDecision[]) => {
    setDecisions(updatedList);
    saveDecisions(updatedList);
    showToast('تم تحديث ارتباطات وتصنيفات القرارات الوزارية بنجاح.');
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
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-cairo">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm animate-fade-in border border-stone-700 no-print">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
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
        totalDecisionsCount={decisions.length}
        decisions={decisions}
        law={currentLaw}
      />

      {/* Hero Strip with Institutional Notice */}
      <section className="bg-stone-900 text-stone-100 py-8 px-4 sm:px-6 lg:px-8 border-b border-stone-800 no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="text-xs font-semibold text-amber-400 flex items-center gap-2">
              <Scale className="w-4 h-4" />
              <span>المنظومة الرقمية للقرارات التنفيذية الرسمية</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              قاعدة القرارات واللوائح الوزارية المنفذة لقانون العمل رقم 14 لسنة 2025
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-2xl">
              مرجع قانوني رسمي متكامل يتيح للباحثين، المحامين، مديري الموارد البشرية، والشركات
              استعراض نصوص القرارات الوزارية، طباعتها بالصيغة المعتمدة، وحفظها بصيغ متعددة
              مع إمكانية تشغيل المنظومة كبرنامج كامل على جهاز الكمبيوتر دون الحاجة إلى اتصال بالإنترنت.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {/* Primary Action: Run as Program Without Internet */}
            <button
              type="button"
              onClick={() => setIsInstallModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-stone-950 font-bold rounded-lg text-xs sm:text-sm shadow-md transition-all cursor-pointer hover:scale-[1.02]"
              title="خيارات تشغيل المنظومة كبرنامج حاسب آلي بدون إنترنت"
            >
              <WifiOff className="w-4 h-4 text-stone-950" />
              <span>تشغيل كبرنامج بدون إنترنت</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingDecision(null);
                setIsFormOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>إضافة قرار جديد</span>
            </button>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <StatsBar decisions={decisions} />

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
      />

      {/* Main Content Area */}
      <main id="decisions-catalog" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full no-print">
        {/* Featured Labor Law 14 Banner with Direct Word & PDF Downloads */}
        <LaborLawBanner
          currentLaw={currentLaw}
          onOpenLawModal={() => setIsLaborLawModalOpen(true)}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
        />

        {filteredDecisions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-md mx-auto my-8">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400 mb-3">
              <FolderOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-900 mb-1">
              لم يتم العثور على قرارات مطابقة
            </h3>
            <p className="text-xs text-stone-500 mb-4 leading-relaxed">
              لا توجد قرارات وزارية تطابق خيارات البحث الحالية. يمكنك تعديل كلمات البحث أو تصفية الفلاتر.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                مسح كل الفلاتر
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingDecision(null);
                  setIsFormOpen(true);
                }}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                إضافة قرار جديد الآن
              </button>
            </div>
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
            onDelete={handleDeleteDecision}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 border-t border-stone-800 py-8 px-4 sm:px-6 lg:px-8 text-xs no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-stone-300">
              قاعدة بيانات القرارات الوزارية المنفذة لقانون العمل رقم 14 لسنة 2025
            </span>
          </div>
          <div className="text-stone-500 text-center sm:text-left">
            نظام قانوني مؤسسي للتوثيق والاستعراض والطباعة الرسمية
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

      {/* Labor Law 14 of 2025 Full View & Word/PDF Modal */}
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
    </div>
  );
}
