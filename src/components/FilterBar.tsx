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
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 space-y-3">
        {/* Top search & quick controls row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none opacity-45">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث برقم التشريع، عنوانه، نص مادة معينة، أو رقم مادة بقانون العمل (مثال: السلامة، المادة 14، الأجور)..."
              className={`w-full pl-9 pr-10 py-2.5 rounded-xl text-xs sm:text-sm transition-all border focus:outline-hidden focus:ring-2 ${
                activeTheme.isDark
                  ? 'bg-zinc-800/90 border-zinc-700/80 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-amber-500/20'
                  : activeTheme.id === 'parchment'
                  ? 'bg-[#fffdf9] border-[#dcd0bf] text-[#2c2016] placeholder:text-[#998675] focus:ring-amber-500/20'
                  : 'bg-stone-50/80 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:ring-amber-500/20 focus:border-stone-400'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 left-0 pl-3 flex items-center opacity-50 hover:opacity-100 cursor-pointer transition-opacity"
                aria-label="مسح البحث"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filter: Favorites + View Mode Toggle */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {/* Favorites Toggle */}
            <button
              type="button"
              onClick={onToggleFavorites}
              className={`min-h-[38px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                showOnlyFavorites
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 font-bold shadow-xs'
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
              className={`flex items-center p-1 border rounded-xl ${
                activeTheme.isDark
                  ? 'bg-zinc-800 border-zinc-700'
                  : 'bg-stone-100/90 border-stone-200'
              }`}
            >
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                className={`min-h-[30px] p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? activeTheme.isDark
                      ? 'bg-zinc-700 text-white shadow-xs'
                      : 'bg-white text-stone-950 shadow-xs'
                    : 'opacity-60 hover:opacity-100'
                }`}
                title="عرض شبكي (بطاقات)"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('table')}
                className={`min-h-[30px] p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? activeTheme.isDark
                      ? 'bg-zinc-700 text-white shadow-xs'
                      : 'bg-white text-stone-950 shadow-xs'
                    : 'opacity-60 hover:opacity-100'
                }`}
                title="عرض جدولي مفصل"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Secondary filters row: Category, Status, Year, Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 pt-1 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="opacity-70 font-medium">التصنيف:</span>
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className={`border rounded-xl py-1.5 px-3 text-xs focus:outline-hidden transition-colors ${
                  activeTheme.isDark
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                    : activeTheme.id === 'parchment'
                    ? 'bg-[#fffdf9] border-[#dcd0bf] text-[#2c2016]'
                    : 'bg-stone-50 border-stone-200 text-stone-800 hover:border-stone-300'
                }`}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Tabs */}
            <div
              className={`flex items-center gap-1 p-0.5 rounded-xl border ${
                activeTheme.isDark
                  ? 'bg-zinc-800/80 border-zinc-700'
                  : 'bg-stone-100/90 border-stone-200'
              }`}
            >
              <span className="opacity-70 px-2 font-medium">الحالة:</span>
              {STATUS_LIST.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => onStatusChange(st)}
                  className={`px-2.5 py-1 rounded-lg font-medium text-xs transition-all cursor-pointer ${
                    selectedStatus === st
                      ? 'text-white shadow-xs'
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
              <span className="opacity-70 font-medium">السنة:</span>
              <select
                value={selectedYear}
                onChange={(e) => onYearChange(e.target.value)}
                className={`border rounded-xl py-1.5 px-2.5 text-xs focus:outline-hidden transition-colors ${
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
                className="text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer mr-1 text-xs"
              >
                ✕ إعادة ضبط الفلاتر
              </button>
            )}

            {/* Button to delete decisions without official PDF if any exist */}
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

          {/* Results count text - clean unboxed metadata */}
          <div className="opacity-80 flex items-center gap-2 text-xs">
            <span>
              النتائج: <strong className="font-mono tabular-nums">{totalFiltered}</strong> تشريع موثق
            </span>
            <span aria-hidden="true" className="opacity-40">·</span>
            <span className="text-emerald-700 dark:text-emerald-300 font-bold">
              ✓ كافة التشريعات مرفق بها PDF رسمي
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
