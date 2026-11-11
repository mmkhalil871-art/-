import React from 'react';
import { Search, X, LayoutGrid, List, Star, Filter, Trash2, Printer } from 'lucide-react';
import { CATEGORIES, STATUS_LIST } from '../data/seedDecisions';
import { ViewMode } from '../types/decision';
import { useTheme } from '../context/ThemeContext';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (val: string) => void;
  selectedYear: string;
  onYearChange: (val: string) => void;
  showOnlyFavorites: boolean;
  onToggleFavorites: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalFiltered: number;
  onResetFilters: () => void;
  isFilterActive: boolean;
  onDeleteNonPdfDecisions?: () => void;
  nonPdfCount?: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  selectedYear,
  onYearChange,
  showOnlyFavorites,
  onToggleFavorites,
  viewMode,
  onViewModeChange,
  totalFiltered,
  onResetFilters,
  isFilterActive,
  onDeleteNonPdfDecisions,
  nonPdfCount = 0,
}) => {
  const { activeTheme, activeAccent } = useTheme();

  return (
    <div
      className={`border-b py-3.5 shadow-2xs no-print transition-colors duration-200 ${
        activeTheme.isDark
          ? 'bg-zinc-900/90 border-zinc-800 text-zinc-100'
          : activeTheme.id === 'parchment'
          ? 'bg-[#f7f2e7] border-[#e6dccf] text-[#2c2016]'
          : 'bg-white border-stone-200 text-stone-900'
      }`}
    >
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 space-y-3.5">
        {/* Top search & quick controls row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input - Command Bar Style */}
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none opacity-50 group-focus-within:opacity-100 transition-opacity">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث برقم التشريع، عنوانه، نص مادة معينة، أو رقم مادة بقانون العمل (مثال: السلامة، المادة 50، المادة 208، الأجور)..."
              className={`w-full pl-10 pr-10 py-3 rounded-2xl text-xs sm:text-sm transition-all border shadow-xs focus:outline-hidden focus:ring-4 ${
                activeTheme.isDark
                  ? 'bg-zinc-800/90 border-zinc-700/80 text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500/60 focus:ring-amber-500/10'
                  : activeTheme.id === 'parchment'
                  ? 'bg-[#fffdf9] border-[#dcd0bf] text-[#2c2016] placeholder:text-[#998675] focus:ring-amber-500/15 focus:border-amber-600/50'
                  : 'bg-stone-50/90 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:ring-amber-500/15 focus:border-amber-500/50'
              }`}
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 left-0 pl-3.5 flex items-center opacity-50 hover:opacity-100 cursor-pointer transition-opacity"
                aria-label="مسح البحث"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <div className="absolute inset-y-0 left-0 pl-3.5 hidden sm:flex items-center pointer-events-none opacity-40">
                <kbd className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-current bg-black/5 dark:bg-white/5">
                  /
                </kbd>
              </div>
            )}
          </div>

          {/* Quick Filter: Favorites + View Mode Toggle */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
            {/* Favorites Toggle */}
            <button
              type="button"
              onClick={onToggleFavorites}
              className={`min-h-[42px] flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all cursor-pointer hover:scale-[1.02] active:scale-95 ${
                showOnlyFavorites
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-500 font-bold shadow-xs'
                  : activeTheme.isDark
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-750'
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  showOnlyFavorites ? 'fill-amber-500 text-amber-500' : 'text-stone-400'
                }`}
              />
              <span>المفضلة</span>
            </button>

            {/* Grid vs Table View Mode */}
            <div
              className={`flex items-center p-1 border rounded-2xl ${
                activeTheme.isDark
                  ? 'bg-zinc-800/90 border-zinc-700'
                  : 'bg-stone-100/90 border-stone-200'
              }`}
            >
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                className={`min-h-[34px] px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'grid'
                    ? activeTheme.isDark
                      ? 'bg-zinc-700 text-white shadow-xs font-bold'
                      : 'bg-white text-stone-950 shadow-xs font-bold'
                    : 'opacity-60 hover:opacity-100'
                }`}
                title="عرض شبكي (بطاقات)"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="text-[11px] hidden md:inline">بطاقات</span>
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('table')}
                className={`min-h-[34px] px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'table'
                    ? activeTheme.isDark
                      ? 'bg-zinc-700 text-white shadow-xs font-bold'
                      : 'bg-white text-stone-950 shadow-xs font-bold'
                    : 'opacity-60 hover:opacity-100'
                }`}
                title="عرض جدولي مفصل"
              >
                <List className="w-4 h-4" />
                <span className="text-[11px] hidden md:inline">جدول</span>
              </button>
            </div>
          </div>
        </div>

        {/* Direct Interactive Category Quick-Pills (Horizontal Scroll) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="opacity-60 font-semibold shrink-0 pl-1">التصنيفات:</span>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium text-xs transition-all cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'text-white font-bold shadow-xs'
                    : activeTheme.isDark
                    ? 'bg-zinc-800/60 hover:bg-zinc-800 border-zinc-700/60 text-zinc-300'
                    : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                }`}
                style={isSelected ? { backgroundColor: activeAccent.colorHex, borderColor: activeAccent.colorHex } : undefined}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Status, Year, and Result Count Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs border-t border-black/5 dark:border-white/5">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Tabs */}
            <div
              className={`flex items-center gap-1 p-0.5 rounded-xl border ${
                activeTheme.isDark
                  ? 'bg-zinc-800/80 border-zinc-700'
                  : 'bg-stone-100/90 border-stone-200'
              }`}
            >
              <span className="opacity-65 px-2 font-medium">الحالة:</span>
              {STATUS_LIST.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => onStatusChange(st)}
                  className={`px-2.5 py-1 rounded-lg font-medium text-xs transition-all cursor-pointer ${
                    selectedStatus === st
                      ? 'text-white font-bold shadow-xs'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={
                    selectedStatus === st
                      ? { backgroundColor: activeAccent.colorHex }
                      : undefined
                  }
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Year Selector */}
            <div className="flex items-center gap-1.5">
              <span className="opacity-65 font-medium">السنة:</span>
              <select
                value={selectedYear}
                onChange={(e) => onYearChange(e.target.value)}
                className={`border rounded-xl py-1.5 px-3 text-xs focus:outline-hidden transition-colors ${
                  activeTheme.isDark
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                    : activeTheme.id === 'parchment'
                    ? 'bg-[#fffdf9] border-[#dcd0bf] text-[#2c2016]'
                    : 'bg-stone-50 border-stone-200 text-stone-800 hover:border-stone-300'
                }`}
              >
                <option value="الكل">كل السنوات</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>

            {isFilterActive && (
              <button
                type="button"
                onClick={onResetFilters}
                className="text-rose-600 dark:text-rose-400 hover:underline font-bold cursor-pointer mr-1 text-xs flex items-center gap-1"
              >
                <span>✕</span>
                <span>إعادة ضبط الفلاتر</span>
              </button>
            )}

            {/* Delete decisions without PDF if any */}
            {nonPdfCount > 0 && onDeleteNonPdfDecisions && (
              <button
                type="button"
                onClick={onDeleteNonPdfDecisions}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 hover:bg-rose-100 cursor-pointer transition-colors mr-2"
                title="احذف كافة القرارات التي لا يوجد لها مستند بي دي اف نسخة رسمية"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>حذف {nonPdfCount} تشريع بدون PDF رسمي</span>
              </button>
            )}
          </div>

          {/* Results count indicator */}
          <div className="opacity-80 flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>النتائج:</span>
              <strong className="font-mono tabular-nums text-sm font-black">{totalFiltered}</strong>
              <span>تشريع موثق</span>
            </span>
            <span aria-hidden="true" className="opacity-40">·</span>
            <span className="text-emerald-700 dark:text-emerald-300 font-bold hidden sm:inline">
              ✓ كافة التشريعات مرفق بها PDF رسمي
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
