import React from 'react';
import { Search, X, LayoutGrid, List, Star, Filter } from 'lucide-react';
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
}) => {
  const { activeTheme, activeAccent } = useTheme();

  return (
    <div
      className={`border-b py-4 shadow-2xs no-print transition-colors duration-200 ${
        activeTheme.isDark
          ? 'bg-zinc-900/90 border-zinc-800 text-zinc-100'
          : activeTheme.id === 'parchment'
          ? 'bg-[#f7f2e7] border-[#e6dccf] text-[#2c2016]'
          : 'bg-white border-stone-200 text-stone-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        {/* Top search & quick controls row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none opacity-50">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث برقم القرار، عنوانه، نص مادة معينة، أو رقم مادة بقانون العمل (مثال: السلامة، المادة 14، الأجور)..."
              className={`w-full pl-9 pr-10 py-2.5 rounded-lg text-sm transition-colors border focus:outline-hidden focus:ring-2 ${
                activeTheme.isDark
                  ? 'bg-zinc-800/80 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500'
                  : activeTheme.id === 'parchment'
                  ? 'bg-[#fffdf9] border-[#dcd0bf] text-[#2c2016] placeholder:text-[#998675]'
                  : 'bg-stone-50 border-stone-300 text-stone-900 placeholder:text-stone-400'
              }`}
              style={{
                outlineColor: activeAccent.colorHex,
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 left-0 pl-3 flex items-center opacity-60 hover:opacity-100 cursor-pointer"
                aria-label="مسح البحث"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filter: Favorites + View Mode Toggle */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Favorites Toggle */}
            <button
              type="button"
              onClick={onToggleFavorites}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                showOnlyFavorites
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 font-bold'
                  : activeTheme.isDark
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-750'
                  : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
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
              className={`flex items-center p-0.5 border rounded-lg ${
                activeTheme.isDark
                  ? 'bg-zinc-800 border-zinc-700'
                  : 'bg-stone-100 border-stone-300'
              }`}
            >
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? activeTheme.isDark
                      ? 'bg-zinc-700 text-white shadow-2xs'
                      : 'bg-white text-stone-900 shadow-2xs'
                    : 'opacity-60 hover:opacity-100'
                }`}
                title="عرض شبكي (بطاقات)"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('table')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? activeTheme.isDark
                      ? 'bg-zinc-700 text-white shadow-2xs'
                      : 'bg-white text-stone-900 shadow-2xs'
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
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="opacity-70 font-medium">التصنيف:</span>
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className={`border rounded-md py-1 px-2.5 text-xs focus:outline-hidden ${
                  activeTheme.isDark
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                    : activeTheme.id === 'parchment'
                    ? 'bg-[#fffdf9] border-[#dcd0bf] text-[#2c2016]'
                    : 'bg-stone-50 border-stone-300 text-stone-800'
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
              className={`flex items-center gap-1 p-0.5 rounded-md ${
                activeTheme.isDark ? 'bg-zinc-800' : 'bg-stone-100'
              }`}
            >
              <span className="opacity-70 px-1.5 font-medium">الحالة:</span>
              {STATUS_LIST.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => onStatusChange(st)}
                  className={`px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                    selectedStatus === st
                      ? 'text-white'
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
                className={`border rounded-md py-1 px-2 text-xs focus:outline-hidden ${
                  activeTheme.isDark
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                    : activeTheme.id === 'parchment'
                    ? 'bg-[#fffdf9] border-[#dcd0bf] text-[#2c2016]'
                    : 'bg-stone-50 border-stone-300 text-stone-800'
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
                className="text-red-500 hover:text-red-600 underline cursor-pointer mr-2"
              >
                إعادة ضبط الفلاتر
              </button>
            )}
          </div>

          {/* Results count text */}
          <div className="opacity-75">
            <span>عدد النتائج: </span>
            <span
              className="font-mono tabular-nums font-bold"
              style={{ color: activeAccent.colorHex }}
            >
              {totalFiltered}
            </span>
            <span> قرار وزاري</span>
          </div>
        </div>
      </div>
    </div>
  );
};
